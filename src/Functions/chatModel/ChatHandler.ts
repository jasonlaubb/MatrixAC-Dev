import {
    world,
    system
} from "@minecraft/server";

import config from "../../Data/Config";
import { antiSpamModule } from "../../Modules/Misc/Spammer";
import { inputCommand } from "./CommandSystem";
import { chatRank } from "./ChatRank";

//@ts-ignore
world.beforeEvents.chatSend.subscribe(({ sender: player, message, cancel }) => {
    const prefix: string = (world.getDynamicProperty("prefix") ?? config.commands.prefix) as string
    
    if (message.startsWith(prefix)) {
        cancel = true
        inputCommand (player, message, prefix)
        return
    }

    if (player.getDynamicProperty("mute") === true) {
        cancel = true;
        system.run(() => player.sendMessage("§2§l§¶Matrix >§4 You are muted!"))
        return
    }

    if (antiSpamModule(message, player) === true) {
        cancel = true;
        return
    }

    const chatRankToggle = (world.getDynamicProperty("chatRank") ?? config.chatRank.enabled) as boolean;
    
    if (chatRankToggle) {
        cancel = true;
        chatRank(player, message)
    }
})