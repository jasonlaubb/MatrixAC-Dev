import {
    world,
    system,
    Vector3,
    GameMode,
    Player
} from "@minecraft/server";
import config from "../../Data/Config.js";
import { flag, isAdmin } from "../../Assets/Util.js";

const speedData = new Map();

/**
 * @author ravriv
 * @description Speed of the player is calculated based on their velocity in the x and z directions.
 * This speed is converted from blocks per tick to miles per hour
 */

class PlayerInfo {
    highestSpeed: number;
    initialLocation: Vector3;
}

system.runInterval(() => {
    const toggle: boolean = (world.getDynamicProperty("antiSpeed") ?? config.antiSpeed.enabled) as boolean;
    if (toggle !== true) return;
    
    const now: number = Date.now();
    for (const player of world.getPlayers({ excludeGameModes: [GameMode['creative'], GameMode['spectator']] })) {
        const { id } = player;
        if (isAdmin (player)) return;
        //@ts-expect-error
        if (player.threwTridentAt && now - player.threwTridentAt < 2000 || player.lastExplosionTime && now - player.lastExplosionTime < 2000) {
            continue;
        }

        const { x, z } = player.getVelocity();
        const playerSpeedMph: number = Math.hypot(x, z) * 72000 / 1609.34;
        const playerInfo: PlayerInfo = speedData.get(id);
        const isSpeeding: boolean = playerSpeedMph > config.antiSpeed.mphThreshold && speedData.has(id);
        const isNotSpeeding: boolean = playerSpeedMph <= config.antiSpeed.mphThreshold && speedData.has(id);

        if (playerSpeedMph === 0) {
            speedData.set(id, { initialLocation: player.location });
        } else if (isSpeeding) {
            if (!playerInfo.highestSpeed) {
                player.teleport(playerInfo.initialLocation, { dimension: player.dimension, rotation: { x: -180, y: 0 } });
                flag (player, 'Speed', config.antiSpeed.punishment, [`Miles Per Hour:${playerSpeedMph.toFixed(2)}`])
                player.applyDamage(6);
                playerInfo.highestSpeed = playerSpeedMph;
            }
        } else if (isNotSpeeding) {
            playerInfo.highestSpeed = 0;
        }
    }
}, 2);

world.afterEvents.itemReleaseUse.subscribe(({ itemStack, source: player }) => {
    if (itemStack.typeId === 'minecraft:trident' && player instanceof Player) {
        //@ts-expect-error
        player.threwTridentAt = Date.now();
    }
});

world.afterEvents.entityHurt.subscribe(event => {
    const player = event.hurtEntity;
    if (event.damageSource.cause == "entityExplosion" || event.damageSource.cause == "blockExplosion") {
        //@ts-expect-error
        player.lastExplosionTime = Date.now();
    }
});

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
    speedData.delete(playerId);
})