import {
    Player,
    system,
    world
} from "@minecraft/server";
import { helpList, toggleList, validModules } from "../../Data/Help"
import { isAdmin } from "../../Assets/Util";
import config from "../../Data/Config";

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
            if (!Command.new(player, config.commands.op as Cmds)) return
            if (regax[1] === undefined) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Please specify the player`))
            const target = world.getPlayers({ name: regax[1] })[0]
            if (target === null) return system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Unknown player`))
            target.setDynamicProperty("isAdmin", undefined)
            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 ${target.name} has been deopped by ${player.name}`))
            break
        }
        default: {
            system.run(() => player.sendMessage(`§2§l§¶Matrix >§4 Unknown command, try ${prefix}help`))
            break
        }
    }
}