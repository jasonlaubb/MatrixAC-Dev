/**
 * @author ravriv & jasonlaubb
 * @description The config json of the AntiCheat
 * 
 * @warning
 * The setting of config maybe changed in dynamic properties (change config will not effect the server)
 */

export default {
    /** 
     * @description
     * The setting for our functions
     */
    commands: {
        password: "password", // The password for op command
        prefix: "-", // The prefix of commands
        help: {
            enabled: true,
            adminOnly: true,
            requireTag: undefined
        },
        toggles: {
            enabled: true,
            adminOnly: true,
            requireTag: undefined
        },
        toggle: {
            enabled: true,
            adminOnly: true,
            requireTag: undefined
        },
        op: {
            enabled: true,
            adminOnly: false,
            requireTag: undefined
        },
        deop: {
            enabled: true,
            adminOnly: true,
            requireTag: undefined
        },
        passwords: {
            enabled: true,
            adminOnly: true,
            requireTag: undefined
        },
        rank: {
            enabled: true,
            adminOnly: true,
            requireTag: undefined
        },
        defaultrank: {
            enabled: true,
            adminOnly: true,
            requireTag: undefined
        },
        showallrank: {
            enabled: true,
            adminOnly: true,
            requireTag: undefined
        }
    },
    chatRank: {
        enabled: true,
        defaultRank: "§gMember",
        showAllRank: true
    },
    /** 
     * @description
     * The config of all anticheat modules
    */

    antiAutoClicker: {
        enabled: true,
        maxClicksPerSecond: 22,
        timeout: 200,
        punishment: undefined
    },

    antiKillAura: {
        enabled: true,
        minAngle: 120,
        timeout: 200,
        maxEntityHit: 2,
        punishment: undefined
    },

    antiReach: {
        enabled: true,
        maxReach: 6,
        maxYReach: 4.8,
        punishment: undefined
    },

    antiFly: {
        enabled: true,
        minFallInterval: 1200,
        maxFallCount: 2,
        maxFlyTimer: 1,
        punishment: undefined
    },

    antiPhase: {
        enabled: true,
        punishment: undefined
    },

    antiSpeed: {
        enabled: true,
        mphThreshold: 150,
        punishment: undefined
    },

    antiNuker: {
        enabled: true,
        maxBreakPerTick: 5,
        timeout: 60,
        punishment: undefined
    },

    antiScaffold: {
        enabled: true,
        timeout: 20,
        maxAngle: 95,
        factor: 1,
        minRotation: 34.98,
        punishment: undefined
    },

    antiSpam: {
        enabled: true,
        maxMessagesPerSecond: 3,
        timer: 500,
        maxCharacterLimit: 200,
        kickThreshold: 3,
        timeout: 200,
        punishment: undefined
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
}