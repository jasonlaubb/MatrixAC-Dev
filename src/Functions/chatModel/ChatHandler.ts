import {
    world
} from "@minecraft/server";

import config from "../../Data/Config";
import { antiSpamModule } from "../../Modules/Misc/Spammer";
import { inputCommand } from "./CommandSystem";

world.beforeEvents.chatSend.subscribe(({ sender: player, message, cancel }) => {
    const prefix: string = (world.getDynamicProperty("prefix") ?? config.commands.prefix) as string
    
    if (message.startsWith(prefix)) {
        cancel = true
        inputCommand (player, message)
        return
    }

    if (antiSpamModule(message, player) === true) {
        cancel = true;
        return
    }

    const chatRankToggle = (world.getDynamicProperty("chatRank") ?? config.chatRank.enabled) as boolean;

    if (chatRankToggle) {
        cancel = true;
        let ranks: string[] | string = player.getTags().filter(rank => rank.startsWith("rank:"))
        ranks = ranks.length > 0 ? ranks.map(rank => `§r§7${rank.slice(5)}§r`) : [config.chatRank.defaultRank]

        if (config.chatRank.showAllRank) {
            ranks = ranks.join("§8, §r")
        } else {
            ranks = ranks[0]
        }

        world.sendMessage(`§8[§7${ranks}§r§8] §r§f${player.name}§r§f: ${message}`)
    }
})