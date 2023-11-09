"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@minecraft/server");
const Config_js_1 = __importDefault(require("../../Data/Config.js"));
/**
 * @author ravriv
 * @description This is a simple spammer detector. It stops both player spamming and spammer clients
 */
class Data {
    warnings;
    lastMessageTimes;
}
;
const previousMessage = new Map();
const spamData = new Map();
const checkSpam = (player, behavior) => {
    server_1.world.sendMessage(`§2§l§¶Matrix >§4 ${player.name}§m has detected ${behavior}`);
    player.runCommandAsync(`kick "${player.name}" §2§l§¶Matrix >§m You have been kicked for ${behavior}`);
};
const antiSpam = (player, data) => {
    data.warnings++;
    if (data.warnings <= Config_js_1.default.antiSpam.kickThreshold) {
        player.sendMessage(`§2§l§¶Matrix >§m Please send messages slowly\n§8§l§¶Warning ${data.warnings} out of ${Config_js_1.default.antiSpam.kickThreshold}`);
    }
    server_1.system.runTimeout(() => {
        data.warnings = 0;
        spamData.set(player.id, data);
    }, Config_js_1.default.antiSpam.timeout);
    if (data.warnings > Config_js_1.default.antiSpam.kickThreshold) {
        player.runCommandAsync(`kick "${player.name}" §2§l§¶Matrix >§m You have been kicked for spamming`);
        server_1.world.sendMessage(`§2§l§¶Matrix >§4 ${player.name}§m has been kicked for spamming`);
    }
};
server_1.world.beforeEvents.chatSend.subscribe(data => {
    const { message, sender: player } = data;
    if (previousMessage.has(player.id) && previousMessage.get(player.id) === message) {
        data.cancel = true;
        player.sendMessage('§2§l§¶Matrix >§m You cannot send the same message again');
    }
    else {
        previousMessage.set(player.id, message);
    }
    if (message.length > Config_js_1.default.antiSpam.maxCharacterLimit) {
        data.cancel = true;
        player.sendMessage(`§2§2§l§¶Matrix >§m Your message is too long\n§r§l§¶§8The maximum length is ${Config_js_1.default.antiSpam.maxCharacterLimit} characters`);
    }
    else if (Config_js_1.default.chatFilter.some((word) => message.toLowerCase().includes(word))) {
        data.cancel = true;
        player.sendMessage(`§2§l§¶Matrix >§m Your message contains a filtered word`);
    }
});
server_1.world.afterEvents.chatSend.subscribe(({ message, sender: player }) => {
    const data = spamData.get(player.id) || { lastMessageTimes: [], warnings: 0 };
    if (player.hasTag('one') && !player.getEffect("mining_fatigue"))
        checkSpam(player, "sending messages while swinging their hand");
    if (player.hasTag('two'))
        checkSpam(player, "sending messages while using an item");
    if (Config_js_1.default.blacklistedMessages.some((word) => message.includes(word))) {
        player.runCommandAsync(`kick "${player.name}" §2§l§¶Matrix >§m You have been kicked for saying ${message} a blacklisted message`);
        server_1.world.sendMessage(`§2§l§¶Matrix >§4 ${player.name}§m has been kicked for saying ${message} a blacklisted message`);
        return;
    }
    const currentTime = Date.now();
    data.lastMessageTimes.push(currentTime);
    if (data.lastMessageTimes.length > Config_js_1.default.antiSpam.maxMessagesPerSecond) {
        data.lastMessageTimes.shift();
    }
    if (data.lastMessageTimes.length >= Config_js_1.default.antiSpam.maxMessagesPerSecond &&
        data.lastMessageTimes[data.lastMessageTimes.length - 1] - data.lastMessageTimes[0] < Config_js_1.default.antiSpam.timer) {
        antiSpam(player, data);
    }
    spamData.set(player.id, data);
});
