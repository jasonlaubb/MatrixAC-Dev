import { world, system, Vector3, Dimension } from "@minecraft/server";

import config from "../../Data/Config";

const previousLocations = new Map<string, Vector3>();
import { flag, isAdmin } from "../../Assets/Util";
import { MinecraftBlockTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";

/**
 * @author ravriv & RaMiGamerDev
 * @description This is a simple anti-fly that detects players using Fly Vanilla/CubeGlide/Motion.
 */

system.runInterval(() => {
    const toggle: boolean = (world.getDynamicProperty("antiFly") ?? config.antiFly.enabled) as boolean;
    if (toggle !== true) return;

    for (const player of world.getAllPlayers()) {
        if (isAdmin(player)) return;
        const { id, isOnGround }: any = player;
        const velocityY: number = player.getVelocity().y;
        if (player.isFlying || player.isInWater) return

        if (!isOnGround && velocityY === 0) {
            const prevLoc = previousLocations.get(id);
            flag (player, "Fly", config.antiFly.punishment, ["velocityY:0"])
            player.teleport(prevLoc);
        }
    }
}, 10);

function seachForSlimeBlock (dimension: Dimension, location: Vector3) {
    const index = [-1, 0, 1]

    const floorPos = {
        x: Math.floor(location.x),
        y: Math.floor(location.y),
        z: Math.floor(location.z)
    } as Vector3

    return index.some(x => index.some(y => index.some(z => {
        dimension.getBlock({
            x: floorPos.x + x, y: floorPos.y + y, z: floorPos.z + z
        }).typeId === MinecraftBlockTypes.Slime
    })))
    
}

system.runInterval(() => {
    const toggle: boolean = (world.getDynamicProperty("antiFly") ?? config.antiFly.enabled) as boolean;
    if (toggle !== true) return;

    const now: number = Date.now()

    for (const player of world.getAllPlayers()) {
        if (isAdmin(player)) return;
        const { id }: any = player;
        const velocityY: number = player.getVelocity().y;
        const playerPrevPos = previousLocations.get(id);
        if (playerPrevPos === undefined || player.isOnGround && velocityY === 0 || velocityY < 0 && player.location.y < previousLocations.get(id)?.y) {
            previousLocations.set(id, player.location);
        }
        //@ts-expect-error
        if ((player.threwTridentAt && now - player.threwTridentAt < 2000) || (player.lastExplosionTime && now - player.lastExplosionTime < 2000)) return;
        if (player.isInWater || player.isGliding) return;

        const didFindSlime: boolean = seachForSlimeBlock (player.dimension, player.location)

        if (didFindSlime) {
            player.addTag("matrix:slime")
        } else {
            player.removeTag("matrix:slime")
        }

        if (didFindSlime && player.isFalling) {
            player.removeTag("matrix:slime")
        }

        if (velocityY > 0.7 && !player.hasTag("matrix:slime")) {
            if (velocityY % 0 === 0) return;
            const prevLoc = previousLocations.get(id);
            flag (player, "Fly", config.antiFly.punishment, [`velocityY:${velocityY.toFixed(2)}`])
            player.teleport(prevLoc);
        }
    }
})

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
    const id = playerId;
    previousLocations.delete(id);
})
