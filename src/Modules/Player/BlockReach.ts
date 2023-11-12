import { Vector, world, system } from "@minecraft/server"
import { flag, isAdmin } from "../../Assets/Util"
import { isTargetGamemode } from "../../Assets/Util"
import config from "../../Data/Config.js"

/**
 * @author jasonlaubb
 * @description A simple checks for block reach, detect low range of blockReach clients
 */

world.beforeEvents.playerBreakBlock.subscribe(event => {
    const toggle: boolean = (world.getDynamicProperty("antiBlockReach") ?? config.antiScaffold.enabled) as boolean;
    if (toggle !== true) return;

    const { player, block } = event
    if (isAdmin (player) || player.hasTag("matrix:break-disabled") || isTargetGamemode(player, 1)) return;
    const distance = Vector.distance(player.getHeadLocation(), block.location);

    if (distance > config.antiBlockReach.maxBreakDistance) {
        event.cancel = true;
        system.run(() => {
            const player2 = world.getPlayers({ name: player.name })[0]
            if (player2.hasTag("matrix:break-disabled")) return;
            player.addTag("matrix:break-disabled")
            system.runTimeout(() => player.removeTag("matrix:break-disabled"), config.antiBlockReach.timeout)
            flag (player, "BlockReach", undefined, ["reach:" + distance.toFixed(2), "mode:break"])
        })
    }
})

world.beforeEvents.playerPlaceBlock.subscribe(event => {
    const toggle: boolean = (world.getDynamicProperty("antiBlockReach") ?? config.antiScaffold.enabled) as boolean;
    if (toggle !== true) return;

    const { player, block } = event
    if (isAdmin (player) || player.hasTag("matrix:break-disabled") || isTargetGamemode(player, 1)) return;
    const distance = Vector.distance(player.getHeadLocation(), block.location);

    if (distance > config.antiBlockReach.maxPlaceDistance) {
        event.cancel = true;
        system.run(() => {
            const player2 = world.getPlayers({ name: player.name })[0]
            if (player2.hasTag("matrix:place-disabled")) return;
            player.addTag("matrix:place-disabled")
            system.runTimeout(() => player.removeTag("matrix:place-disabled"), config.antiBlockReach.timeout)
            flag (player, "BlockReach", undefined, ["reach:" + distance.toFixed(2), "mode:place"])
        })
    }
})