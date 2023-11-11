import { world, system } from "@minecraft/server";

const flyData = new Map();
const fallData = new Map();
const previousLocations = new Map();

/**
 * @author ravriv & RaMiGamerDev
 * @description This is a simple anti-fly that detects players using Fly Vanilla/CubeGlide/Motion.
 */

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const { name, location: { x, y, z }, isOnGround } = player;
        const velocityY = player.getVelocity().y;
        const { flyTimer = 0 } = flyData.get(name) || {};

        if (isOnGround) {
            previousLocations.set(name, { x, y, z });
        }

        if (!flyData.has(name) || (isOnGround && velocityY === 0)) {
            flyData.set(name, { flyTimer });
        }

        if (velocityY === 0 && !isOnGround) {
            flyData.set(name, { flyTimer: flyTimer + 1 });
        }

        if (flyTimer > 1 && velocityY === 0) {
            if (flyData.has(name)) {
                const prevLoc = previousLocations.get(name);
                world.sendMessage(`§2§l§¶Matrix >§4 ${name}§m has been detected using Fly\n§r§l§¶Velocity Y:§c ${velocityY}`);
                player.teleport(prevLoc);
                flyData.delete(name);
            }
        }
    }
}, 20);

world.afterEvents.entityHurt.subscribe(event => {
    const player = event.hurtEntity;
    const damageSource = event.damageSource.cause;

    if (player.isFalling && damageSource === "fall") {
        const { name } = player;

        const currentfallData = fallData.get(name) || { count: 0, lastFallDamageTime: 0 };
        const currentTime = Date.now();
        if (currentTime - currentfallData.lastFallDamageTime < 1200) {
            currentfallData.count++;
        } else {
            currentfallData.count = 1;
        }
        currentfallData.lastFallDamageTime = currentTime;
        fallData.set(name, currentfallData);

        if (currentfallData.count >= 2) {
            const prevLoc = previousLocations.get(name);
            if (prevLoc) {
                player.teleport(prevLoc);
                world.sendMessage(`§2§l§¶Matrix >§4 ${name}§m has been detected using Fly\n§r§l§¶Type:§c Invalid Fall Damage`);
                fallData.delete(name);
            }
        }
    }
});
