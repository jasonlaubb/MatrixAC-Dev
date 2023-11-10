import { world, system, Player, Vector3 } from "@minecraft/server"
import { flag } from "../../Assets/Util"

/**
 * @author RaMiGamerDev
 * @description A simple check to detect fly
 */

const groundPos = new Map<string, Vector3>()

const FlyA = (player: Player) => {
    const groundLocation: Vector3 = groundPos.get(player.id) ?? player.location

    const velocity: Vector3 = player.getVelocity()

    if (player.isOnGround) {
        groundPos.set(player.id, player.location)
    }

    if (player.isFlying || player.isClimbing || player.isInWater || player.isSwimming) return

    if (velocity.y === 0 && !player.isOnGround && Math.hypot(velocity.x, velocity.z) > 0.1) {
        player.teleport(groundLocation)
        flag (player, 'Fly', undefined, [`velocityY:0`])
    }
}

const lastPos = new Map<string, Vector3>()

const FlyB = (player: Player) => {
    const playerLocation: Vector3 = player.location
    const velocity: number = player.getVelocity().y
    const floorPos: Vector3 = {
        x: Math.floor(player.location.x),
        y: Math.floor(player.location.y),
        z: Math.floor(player.location.z)
    }

    const checkSlime: boolean = [-1, 0, 1].some(x => [-1, 0, 1].some(y => [-1, 0, 1].some(z => player.dimension.getBlock({
        x: floorPos.x + x,
        y: floorPos.y + y,
        z: floorPos.z + z
    })?.typeId === "minecraft:slime")))

        if (data.lastExplosionTime && Date.now() - data.lastExplosionTime < 2000) return

    if (player.isOnGround == true && velocity === 0 || velocity < 0 && player.location.y < lastPos.get(player.id).y || lastPos.get(player.id) === undefined) {
        lastPos.set(player.id, playerLocation)
    }

    if (player.isFlying || checkSlime) return

    if (velocity > 0.7) {
        player.teleport(lastPos.get(player.id))
        flag (player, 'Fly', undefined, [`velocityY:${velocity}`,"limit:0.7"])
    }
}

system.runInterval(() => {
    world.getPlayers({ excludeTags: ["admin"] }).forEach(player => {
        FlyA (player)
        FlyB (player)
    })
}, 5)
