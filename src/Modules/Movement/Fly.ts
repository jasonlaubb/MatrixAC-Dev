import { world, system } from "@minecraft/server";

const previousLocations = new Map();

system.runInterval(() => {
    const now = Date.now();
    for (const player of world.getPlayers({ excludeGameModes: ['creative', 'spectator'] })) {
        const { id, name, isOnGround, isFlying, isInWater, isGliding, isFalling, threwTridentAt, lastExplosionTime } = player;
        const hasEffect = player.getEffect("jump_boost") || player.getEffect("levitation");
        const prevLoc = previousLocations.get(id);
        const { x, y, z } = player.getVelocity();

        if (isFlying || isInWater || isGliding || isFalling || hasEffect || (threwTridentAt && now - threwTridentAt < 3000) || (lastExplosionTime && now - lastExplosionTime < 5000)) {
            continue;
        }

        if (!prevLoc && isOnGround) {
            previousLocations.set(id, player.location);
        }

        if (!isOnGround && prevLoc) {
            if (y > 0.7 && (Math.abs(x) > 0.39 || Math.abs(z) > 0.39)) {
                player.teleport(prevLoc);
                player.applyDamage(8);
                world.sendMessage(`§2§l§¶Matrix >§4 ${name}§m has been detected using Fly\n§r§l§¶Velocity:§c X:§r§l§¶ ${x.toFixed(2)}§a Y:§r§l§¶ ${y.toFixed(2)}§3 Z:§r§l§¶ ${z.toFixed(2)}`);
            }
        }
    }
}, 1);
