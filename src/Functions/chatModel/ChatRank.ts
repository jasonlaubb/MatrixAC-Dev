import { Player, world } from "@minecraft/server";
import config from "../../Data/Config";

export { chatRank }

async function chatRank (player: Player, message: string) {
    let ranks: string[] | string = player.getTags().filter(rank => rank.startsWith("rank:"))
    ranks = ranks.length > 0 ? ranks.map(rank => `§r§7${rank.slice(5)}§r`) : [config.chatRank.defaultRank]
    ranks = config.chatRank.showAllRank ? ranks.join('\n') : ranks[0]

    world.sendMessage(`§8[§7${ranks}§r§8] §r§f${player.name} §r§c»§r ${message}`)
}