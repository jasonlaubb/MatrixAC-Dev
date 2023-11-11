import {
    world,
    system,
    Player
} from "@minecraft/server";
import config from "../../Data/Config.js";
import { flag, kick } from "../../Assets/Util.js";

/**
 * @author ravriv
 * @description This is a simple spammer detector. It stops both player spamming and spammer clients
 */

class Data {
    warnings: number;
    lastMessageTimes: number[];
};

const previousMessage: Map<string, string> = new Map<string, string>();
const spamData: Map<string, Data> = new Map<string, Data>();

const checkSpam = (player: Player, behavior: string) => {
    world.sendMessage(`§2§l§¶Matrix >§4 ${player.name}§m has detected ${behavior}`);
    system.run(() => flag (player, "Spammer", config.antiSpam.punishment, [`behavior:${behavior}`]));
};

const antiSpam = (player: Player, data: Data) => {
    data.warnings++;

    if (data.warnings <= config.antiSpam.kickThreshold) {
        player.sendMessage(`§2§l§¶Matrix >§m Please send messages slowly\n§8§l§¶Warning ${data.warnings} out of ${config.antiSpam.kickThreshold}`);
    }

    system.runTimeout(() => {
        data.warnings = 0;
        spamData.set(player.id, data);
    }, config.antiSpam.timeout);

    if (data.warnings > config.antiSpam.kickThreshold) {
        system.run(() => kick (player, 'spamming', 'Matrix'))
        world.sendMessage(`§2§l§¶Matrix >§4 ${player.name}§m has been kicked for spamming`);
    }
};

world.beforeEvents.chatSend.subscribe(data => {
    const { message, sender: player } = data;

    if (previousMessage.has(player.id) && previousMessage.get(player.id) === message) {
        data.cancel = true;
        player.sendMessage('§2§l§¶Matrix >§m You cannot send the same message again');
    } else {
        previousMessage.set(player.id, message);
    }

    if (message.length > config.antiSpam.maxCharacterLimit) {
        data.cancel = true;
        player.sendMessage(`§2§2§l§¶Matrix >§m Your message is too long\n§r§l§¶§8The maximum length is ${config.antiSpam.maxCharacterLimit} characters`);
    } else if (config.chatFilter.some((word) => message.toLowerCase().includes(word))) {
        data.cancel = true;
        player.sendMessage(`§2§l§¶Matrix >§m Your message contains a filtered word`);
    }
});

world.afterEvents.chatSend.subscribe(({ message, sender: player }) => {
    const data: Data = spamData.get(player.id) || { lastMessageTimes: [], warnings: 0 } as Data;

    if (player.hasTag('one') && !player.getEffect("mining_fatigue")) checkSpam(player, "sending messages while swinging their hand");
    if (player.hasTag('two')) checkSpam(player, "sending messages while using an item");

    if (config.blacklistedMessages.some((word) => message.includes(word))) {
        kick (player, 'blacklisted message', 'Matrix')
        world.sendMessage(`§2§l§¶Matrix >§4 ${player.name}§m has been kicked for saying ${message} a blacklisted message`);
        return;
    }

    const currentTime: number = Date.now();
    data.lastMessageTimes.push(currentTime);

    if (data.lastMessageTimes.length > config.antiSpam.maxMessagesPerSecond) {
        data.lastMessageTimes.shift();
    }

    if (data.lastMessageTimes.length >= config.antiSpam.maxMessagesPerSecond &&
        data.lastMessageTimes[data.lastMessageTimes.length - 1] - data.lastMessageTimes[0] < config.antiSpam.timer) {
        antiSpam(player, data);
    }

    spamData.set(player.id, data);
});