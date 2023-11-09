"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@minecraft/server");
const Config_js_1 = __importDefault(require("../../Data/Config.js"));
const speedData = new Map();
/**
 * @author ravriv
 * @description Speed of the player is calculated based on their velocity in the x and z directions.
 * This speed is converted from blocks per tick to miles per hour
 */
class PlayerInfo {
    highestSpeed;
    initialLocation;
}
server_1.system.runInterval(() => {
    const now = Date.now();
    for (const player of server_1.world.getPlayers({ excludeTags: ["admin"], excludeGameModes: [server_1.GameMode['creative'], server_1.GameMode['spectator']] })) {
        const { id, name } = player;
        //@ts-expect-error
        if (player.threwTridentAt && now - player.threwTridentAt < 2000 || player.lastExplosionTime && now - player.lastExplosionTime < 2000) {
            continue;
        }
        const { x, z } = player.getVelocity();
        const playerSpeedMph = Math.hypot(x, z) * 72000 / 1609.34;
        const playerInfo = speedData.get(id);
        const isSpeeding = playerSpeedMph > Config_js_1.default.antiSpeed.mphThreshold && speedData.has(id);
        const isNotSpeeding = playerSpeedMph <= Config_js_1.default.antiSpeed.mphThreshold && speedData.has(id);
        if (playerSpeedMph === 0) {
            speedData.set(id, { initialLocation: player.location });
        }
        else if (isSpeeding) {
            if (!playerInfo.highestSpeed) {
                player.teleport(playerInfo.initialLocation, { dimension: player.dimension, rotation: { x: -180, y: 0 } });
                server_1.world.sendMessage(`§2§l§¶Matrix >§4 ${name}§m has been detected with Speed\n§r§l§¶Miles Per Hour:§c ${playerSpeedMph.toFixed(2)}`);
                player.applyDamage(6);
                playerInfo.highestSpeed = playerSpeedMph;
            }
        }
        else if (isNotSpeeding) {
            playerInfo.highestSpeed = 0;
        }
    }
}, 2);
server_1.world.afterEvents.itemReleaseUse.subscribe(({ itemStack, source: player }) => {
    if (itemStack.typeId === 'minecraft:trident' && player instanceof server_1.Player) {
        //@ts-expect-error
        player.threwTridentAt = Date.now();
    }
});
server_1.world.afterEvents.entityHurt.subscribe(event => {
    const player = event.hurtEntity;
    if (event.damageSource.cause == "entityExplosion" || event.damageSource.cause == "blockExplosion") {
        //@ts-expect-error
        player.lastExplosionTime = Date.now();
    }
});
