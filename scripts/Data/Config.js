"use strict";
/**
 * @author ravriv & jasonlaubb
 * @description The config json of the AntiCheat
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    antiAutoClicker: {
        maxClicksPerSecond: 22,
        timeout: 200
    },
    antiKillAura: {
        minAngle: 120,
        timeout: 200
    },
    antiReach: {
        maxReach: 6,
    },
    antiFly: {
        maxAirTime: 4000
    },
    antiSpeed: {
        mphThreshold: 150,
    },
    antiSpam: {
        maxMessagesPerSecond: 3,
        timer: 500,
        maxCharacterLimit: 200,
        kickThreshold: 3,
        timeout: 200
    },
    chatFilter: [
        "niger",
        "nigers",
        "gay",
        "stupid",
        "dumb",
        "noob"
    ],
    blacklistedMessages: [
        "discord.gg",
        "dsc.gg",
        "@outlook.com",
        "@gmail.com",
        "@hotmail.com",
        "discordapp.com",
        "https://",
        "http://",
        "the best minecraft bedrock utility mod",
        "disepi/ambrosial"
    ]
};
