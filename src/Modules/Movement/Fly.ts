import {
    world,
    system,
    Player,
    EntityDamageCause,
    Vector3
} from "@minecraft/server";

import config from "../../Data/Config";

class FallData {
    count: number;
    lastFallDamageTime: number;
}

const fallData = new Map<string, FallData>();
const previousLocations = new Map<string, Vector3>();
import { flag, isAdmin } from "../../Assets/Util";

/**
 * @author ravriv & RaMiGamerDev
 * @description This is a simple anti-fly that detects players using Fly Vanilla/CubeGlide/Motion.
 */

system.runInterval(() => {
    const toggle: boolean = (world.getDynamicProperty("antiFly") ?? config.antiFly.enabled) as boolean;
    if (toggle !== true) return;

    for (const player of world.getAllPlayers()) {
        if (isAdmin(player)) return;
        const { id, location: { x, y, z }, isOnGround }: any = player;
        const velocityY: number = player.getVelocity().y;

        if (isOnGround) {
            previousLocations.set(id, { x, y, z });
        }

        if (velocityY === 0) {
            const prevLoc = previousLocations.get(id);
            flag (player, "Fly", config.antiFly.punishment, ["velocityY:0"])
            player.teleport(prevLoc);
        }
    }
}, 20);

world.afterEvents.entityHurt.subscribe(({ hurtEntity, damageSource }) => {
    const toggle: boolean = (world.getDynamicProperty("antiFly") ?? config.antiFly.enabled) as boolean;
    if (toggle !== true) return;

    const player = hurtEntity;
    const damageCause = damageSource.cause;

    if (!(player instanceof Player)) return
    if (isAdmin(player)) return

    if (player.isFalling && damageCause === EntityDamageCause.fall) {
        const { id } = player;

        const currentfallData = fallData.get(id) || { count: 0, lastFallDamageTime: 0 };
        const currentTime = Date.now();
        if (currentTime - currentfallData.lastFallDamageTime < config.antiFly.minFallInterval) {
            currentfallData.count++;
        } else {
            currentfallData.count = 1;
        }
        currentfallData.lastFallDamageTime = currentTime;
        fallData.set(id, currentfallData);

        if (currentfallData.count >= config.antiFly.maxFallCount) {
            const prevLoc = previousLocations.get(id);
            if (prevLoc) {
                player.teleport(prevLoc);
                flag(player, "Fly", config.antiFly.punishment, ["type:Invalid Fall Damage"])
                fallData.delete(id);
            }
        }
    }
});

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
    const id = playerId;
    fallData.delete(id);
    previousLocations.delete(id);
})