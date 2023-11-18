import { world, system } from "@minecraft/server";
import config from "../../Data/Config";
import { MinecraftEntityTypes } from "@minecraft/vanilla-data";
import { formatInformation, isAdmin } from "../../Assets/Util";

async function antiCBE () {
    const overworld = world.getDimension("minecraft:overworld").getEntities({ type: MinecraftEntityTypes.CommandBlockMinecart })
    const nether = world.getDimension("minecraft:nether").getEntities({ type: MinecraftEntityTypes.CommandBlockMinecart })
    const theEnd = world.getDimension("minecraft:the_end").getEntities({ type: MinecraftEntityTypes.CommandBlockMinecart })

    if (overworld.length > 0 || nether.length > 0 || theEnd.length > 0) {
        overworld.forEach(entity => entity.kill())
        nether.forEach(entity => entity.kill())
        theEnd.forEach(entity => entity.kill())

        const flagMsg = "§2§l§¶Matrix >§m CBE failed §4CommandBlockMinecart§m has been removed\n" + formatInformation(["TotalLength:" + (overworld.length + nether.length + theEnd.length)])
        
        const flagMode = world.getDynamicProperty("flagMode") ?? config.flagMode

        switch (flagMode) {
            case "tag": {
                world.getPlayers({ tags: ["matrix:notify"]}).forEach(players => players.sendMessage(flagMsg))
                break
            }
            case "admin": {
                world.getAllPlayers().filter(players => isAdmin(players)).forEach(players => players.sendMessage(flagMsg))
                break
            }
            default: {
                world.sendMessage(flagMsg)
                break
            }
        }
    }
}

system.runInterval(() => {
    const toggle: boolean = (world.getDynamicProperty("antiCbe") ?? config.antiCbe.enabled) as boolean;
    if (toggle !== true) return;

    antiCBE ()
}, 0)