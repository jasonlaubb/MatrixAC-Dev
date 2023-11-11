import {
    Player,
    system,
    world
} from "@minecraft/server";
import { helpList, toggleList, validModules } from "../../Data/Help"
import { isAdmin, isTimeStr, timeToMs } from "../../Assets/Util";
import config from "../../Data/Config";
import { ban, unban, unbanList, unbanRemove } from "../moderateModel/banHandler";

export { inputCommand }

const turnRegax = (input: string, prefix: string) => [(input.match(/(["'])(.*?)\1|\S+/g).shift().slice(prefix.length)), ...(input.match(/(["'])(.*?)\1|\S+/g).map(arg => arg.replace(/^[@"]/g, '').replace(/"$/, '')))]

class Cmds {
    enabled: boolean;
    adminOnly: boolean;
    requireTag: undefined | string[]
}

class Command {
    static new (player: Player, setting: Cmds): boolean {
        if (setting.enabled !== true) {
            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 This command is disabled`))
            return false
        }
        if (setting.adminOnly === true && !isAdmin(player)){
            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 You are not admin to use this command`))
            return false
        }
        if (setting.requireTag !== undefined && !player.getTags().some(tag => setting.requireTag.includes(tag))) {
            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 You don't have enough permisson to use this command`))
            return false
        }
        return true
    }
}
const inputCommand = (player: Player, message: string, prefix: string): any => {
    const regax = turnRegax(message, prefix)

    switch (regax[0]) {
        case "help": {
            if (!Command.new(player, config.commands.help as Cmds)) return
            const helpMessage: string = helpList(prefix)
            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Help command list:\n${helpMessage}`))
            break
        }
        case "toggles": {
            if (!Command.new(player, config.commands.toggles as Cmds)) return
            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 §2§l§¶Matrix >§4 Toggle list:\n${toggleList(prefix)}`))
            break
        }
        case "toggle": {
            if (!Command.new(player, config.commands.toggle as Cmds)) return
            if (regax[1] === undefined || !(new Set(validModules).has(regax[1]))) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Unknown module, try ${prefix}toggles`))
            if (regax[2] === undefined || !(new Set(["enable", "disable"]).has(regax[2]))) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Unknown action, please use enable/disable only`))

            world.setDynamicProperty(regax[1], regax[2] === "enable" ? true : false)

            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 ${regax[1]} module has been ${regax[2]}d`))
            break
        }
        case "op": {
            if (!Command.new(player, config.commands.op as Cmds)) return
            if (isAdmin(player)) {
                if (regax[1] === undefined) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Please specify the player`))
                const target = world.getPlayers({ name: regax[1] })[0]
                if (target === null) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Unknown player`))
                target.setDynamicProperty("isAdmin", true)
                system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 ${target.name} has been opped by ${player.name}`))
            } else {
                const password: string = regax[1]
                const correctPassword = (world.getDynamicProperty("password") ?? config.commands.password) as string
                if (password === undefined) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Please enter the password`))
                if (password == correctPassword) {
                    player.setDynamicProperty("isAdmin", true)
                    system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 You are now admin`))
                } else {
                    system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Wrong password`))
                }
            }
            break      
        }
        case "deop": {
            if (!Command.new(player, config.commands.deop as Cmds)) return
            if (regax[1] === undefined) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Please specify the player`))
            const target = world.getPlayers({ name: regax[1] })[0]
            if (target === null) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Unknown player`))
            if (!isAdmin(target)) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 ${target.name} is not admin`))
            target.setDynamicProperty("isAdmin", undefined)
            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 ${target.name} has been deopped by ${player.name}`))
            break
        }
        case "passwords": {
            if (!Command.new(player, config.commands.passwords as Cmds)) return
            const oldPassword: string = regax[1]
            const newPassword: string = regax[2]
            const correctPassword = (world.getDynamicProperty("password") ?? config.commands.password) as string
            if (oldPassword === undefined || newPassword === undefined) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Please enter the old password and new password`))
            if (oldPassword !== correctPassword) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Wrong password`))

            world.sendMessage(`§2§l§¶Matrix >§4 ${player.name} has changed the password`)
            world.setDynamicProperty("password", newPassword)
            break
        }
        case "rank": {
            if (!Command.new(player, config.commands.rank as Cmds)) return
            if (regax[1] === undefined || !(new Set(["set", "add", "remove"]).has(regax[1]))) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Unknown action, please use set/add/remove only`))
            if (regax[2] === undefined) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Please specify the player`))
            const target = world.getPlayers({ name: regax[2] })[0]
            if (target === null) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Unknown player`))
            const rank: string = regax[3]
            if (rank === undefined) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Please enter the rank`))
            const ranks: string[] = target.getTags().filter(tag => tag.startsWith("rank:"))
            switch (regax[1]) {
                case "set": {
                    ranks.forEach(rank => target.removeTag(rank))
                    target.addTag(`rank:${rank}`)
                    system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 ${target.name}'s rank has been set to ${rank}`))
                    break
                }
                case "add": {
                    if (!player.hasTag(`rank:${rank}`)) {
                        target.addTag(`rank:${rank}`)
                        system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 ${target.name}'s rank has been added to ${rank}`))
                    } else {
                        system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 ${target.name} already has ${rank} §r§4 rank`))
                    }
                    break
                }
                case "remove": {
                    if (ranks.length > 0) {
                        if (player.hasTag(`rank:${rank}`)) {
                            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 ${target.name}'s rank has been removed`))
                            player.removeTag(`rank:${rank}`)
                        } else {
                            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 ${target.name} doesn't have ${rank} §r§4 rank`))
                        }
                    } else {
                        system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 ${target.name} doesn't have any rank`))
                    }
                    break
                }
            }
            break
        }
        case "defaultrank": {
            if (!Command.new(player, config.commands.defaultrank as Cmds)) return
            const rank: string = regax[1]
            if (rank === undefined) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Please enter the rank`))
            world.setDynamicProperty("defaultRank", rank)
            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Default rank has been set to ${rank}`))
            break
        }
        case "showallrank": {
            if (!Command.new(player, config.commands.showallrank as Cmds)) return
            const toggle: string = regax[1]
            if (toggle === undefined || !(new Set(["true", "false"]).has(toggle))) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Unknown action, please use true/false only`))
            world.setDynamicProperty("showAllRank", Boolean(toggle))
            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Show all rank has been set to ${toggle}`))
            break
        }
        case "ban": {
            if (!Command.new(player, config.commands.ban as Cmds)) return
            if (regax[1] === undefined) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Please specify the player`))
            const target = world.getPlayers({ name: regax[1] })[0]
            if (target === undefined) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Unknown player`))
            if (target.id === player.id) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 You can't ban yourself`))
            if (isAdmin(target)) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 You can't ban admin`))

            const reason = regax[2]
            if (reason === undefined) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Please enter the reason`))

            const time = regax[3]
            if (time === undefined || (!isTimeStr(time) && time != 'forever')) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Please enter the time\nExample: 1d2h3m4s`))

            ban(player, 'reason', player.name, time === 'forever' ? time : Date.now() + timeToMs(time))
            break
        }
        case "unban": {
            if (!Command.new(player, config.commands.unban as Cmds)) return
            if (regax[1] === undefined) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Please specify the player`))

            const targetName = regax[1]

            if (unbanList().includes(targetName)) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 ${targetName} has unbanned already`))
            if (targetName == player.name) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 You can't unban yourself`))

            unban(targetName)
            break
        }
        case "unbanremove": {
            if (!Command.new(player, config.commands.unbanremove as Cmds)) return
            if (regax[1] === undefined) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Please specify the player`))

            const targetName = regax[1]

            if (!unbanRemove(targetName)) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 ${targetName} has not unbanned yet`))
            break
        }
        case "unbanlist": {
            if (!Command.new(player, config.commands.unbanlist as Cmds)) return
            const list = unbanList()
            if (list.length === 0) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 There is no one in unban list`))
            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Unban list:\n${list.join("\n")}`))
            break
        }
        default: {
            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Unknown command, try ${prefix}help`))
            break
        }
    }
}