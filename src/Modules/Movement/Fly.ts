import {
    world,
    system,
    Player,
    Vector3
} from "@minecraft/server"
import { flag } from "../../Assets/Util"

/**
 * @author RaMiGamerDev
 * @description A simple check to detect fly
 */

const lastPos = new Map()

const antiFly = (player: Player) => {
    const playerLocation: Vector3 = player.location
    //get velocity
    const velocity: number = player.getVelocity().y

    //check slime block for prevent false flags
    const floorPos: Vector3 = {
        x: Math.floor(player.location.x),
        y: Math.floor(player.location.y),
        z: Math.floor(player.location.z)
    }

    const checkSlime = [-1, 0, 1].some(x => [-1, 0, 1].some(y => [-1, 0, 1].some(z => player.dimension.getBlock({
        x: floorPos.x + x,
        y: floorPos.y + y,
        z: floorPos.z + z
    })?.typeId === "minecraft:slime")))

    if (velocity <= 0.7 || player.isOnGround) {
        lastPos.set(player.id, playerLocation)
    }

    if (player.isFlying || checkSlime) return

    if (velocity > 0.7) {
        player.teleport(lastPos.get(player.id))
        flag (player, 'Fly', undefined, [`velocityY:${velocity}`,"limit:0.7"])
    }
}

system.runInterval(() => {
    world.getPlayers({ excludeTags: ["admin"] }).forEach(player => antiFly (player))
})
