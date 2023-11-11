import {
    world,
    system,
    Player,
    EntityDamageCause,
    Vector3
} from "@minecraft/server";

import config from "../../Data/Config";

class FlyData {
    flyTimer: number;
}

class FallData {
    count: number;
    lastFallDamageTime: number;
}

const flyData = new Map<string, FlyData>();
const fallData = new Map<string, FallData>();
const previousLocations = new Map<string, Vector3>();
import { flag } from "../../Assets/Util";

/**
 * @author ravriv & RaMiGamerDev
 * @description This is a simple anti-fly that detects players using Fly Vanilla/CubeGlide/Motion.
 */

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const { name, location: { x, y, z }, isOnGround }: any = player;
        const velocityY: number = player.getVelocity().y;
        const { flyTimer = 0 }: any = flyData.get(name) || {};

        if (isOnGround) {
            previousLocations.set(name, { x, y, z });
        }

        if (!flyData.has(name) || (isOnGround && velocityY === 0)) {
            flyData.set(name, { flyTimer });
        }

        if (velocityY === 0 && !isOnGround) {
            flyData.set(name, { flyTimer: flyTimer + 1 });
        }

        if (flyTimer > config.antiFly.maxFlyTimer && velocityY === 0) {
            if (flyData.has(name)) {
                const prevLoc = previousLocations.get(name);
                flag (player, "Fly", config.antiFly.punishment, ["velocityY:0"])
                player.teleport(prevLoc);
                flyData.delete(name);
            }
        }
    }
}, 20);

world.afterEvents.entityHurt.subscribe(event => {
    const player = event.hurtEntity;
    const damageSource = event.damageSource.cause;

    if (!(player instanceof Player)) return

    if (player.isFalling && damageSource === EntityDamageCause.fall) {
        const { name } = player;

        const currentfallData = fallData.get(name) || { count: 0, lastFallDamageTime: 0 };
        const currentTime = Date.now();
        if (currentTime - currentfallData.lastFallDamageTime < config.antiFly.minFallInterval) {
            currentfallData.count++;
        } else {
            currentfallData.count = 1;
        }
        currentfallData.lastFallDamageTime = currentTime;
        fallData.set(name, currentfallData);

        if (currentfallData.count >= config.antiFly.maxFallCount) {
            const prevLoc = previousLocations.get(name);
            if (prevLoc) {
                player.teleport(prevLoc);
                flag(player, "Fly", config.antiFly.punishment, ["type:Invalid Fall Damage"])
                fallData.delete(name);
            }
        }
    }
});
