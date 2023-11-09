import {
    world,
    system,
    Vector3
} from "@minecraft/server";
import { flag, isTargetGamemode } from "../../Assets/Util";

class FlyData {
    lastSafePos: Vector3;
    lastVelocity: number;
}
const flyData: Map<string, FlyData> = new Map<string, FlyData>()

system.runInterval(() => {
    for (const player of world.getPlayers({ excludeTags: ['admin'] })) {
        const velocity: number = player.getVelocity().y
        const flydata = flyData.get(player.id) ?? { lastSafePos: player.location, lastVelocity: velocity }
        if (player.isOnGround) flyData.set(player.id, { lastSafePos: player.location, lastVelocity: flydata.lastVelocity } as FlyData)
        if (player.isOnGround || player.isInWater || player.isSwimming || player.isGliding) continue

        if (!player.hasTag("flymode-disable") && player.isFlying && !player.hasTag("four") && !isTargetGamemode(player, 1) && !isTargetGamemode(player, 3)) {
            player.teleport(flydata.lastSafePos)
            flag (player, 'Fly', undefined, ["mode:incorrect gamemode"])
            player.addTag("flymode-disable")
            system.runTimeout(() => player.removeTag("flymode-disable"), 60)
        }

        if (flydata.lastVelocity > 0.125 && velocity < -0.125) {
            const floorPos: Vector3 = { x: Math.floor(player.location.x), y: Math.floor(player.location.y), z: Math.floor(player.location.z)} as Vector3
            if (![-1,0,1].every(x => [-2,-1,0,1,2].every(y => [-1,0,1].every(z => player.dimension.getBlock({ x: floorPos.x + x, y: floorPos.y + y, z: floorPos.z + z })?.isAir)))) return
            player.teleport(flydata.lastSafePos)
            flag (player, 'Fly', undefined, ["mode:illegal velocity"])
        }

        const velocities = player.getVelocity()

        if (velocity === 0 && Math.abs(velocities.x) > 0.001 && Math.abs(velocities.z) > 0.001) {
            player.teleport(flydata.lastSafePos)
            flag (player, 'Fly', undefined, ["mode:no falling"])
        }

        if (player.fallDistance < -10) {
            player.teleport(flydata.lastSafePos)
            flag (player, 'Fly', undefined, ["mode:negative fall distance"])
        }
    }
})

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (initialSpawn && player.hasTag("flymode-disable")) {
        player.removeTag("flymode-disable")
    }
})