import { world, system, Player } from "@minecraft/server";
import { flag, isAdmin } from "../../Assets/Util";
import config from "../../Data/Config";

/**
 * @author jasonlaubb
 * @description Remove the op from non-admin players
 * @warning This check don't work on Realm or BDS without server properties setting right
 */

async function operator (player: Player) {
    if (isAdmin(player)) return

    const playerIsOp = player.isOp();

    if (playerIsOp) {
        player.setOp(false)
        flag (player, "Operator", 0, config.antiOperator.punishment, undefined)
    }
}

system.runInterval(() => {
    const toggle: boolean = (world.getDynamicProperty("antiOperator") ?? config.antiOperator.enabled) as boolean;
    if (toggle !== true) return

    for (const player of world.getAllPlayers()) {
        operator (player)
    }
}, 20)