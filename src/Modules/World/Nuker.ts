import { system, world } from "@minecraft/server";

const nukerData: Map<string, number> = new Map<string, number>();

/**
 * @author ravriv
 * @description This checks if a player is using Nuker in Minecraft Bedrock.
 * it detects if a player breaks more than 5 blocks.
 */


world.beforeEvents.playerBreakBlock.subscribe(({ player, block, cancel }) => {
    const now: number = Date.now();
    const { name } = player;
    //@ts-expect-error
    const [blockTime, blockPermutation, blockLocation, blockBroken = 0] = player.blockData || [now, brokenBlockPermutation, block.location];

    if (player.hasTag("break-disable")) {
        //stop all block break and nuker detection in next 5 second after detected
        cancel = true
        return
    }

    if (blockTime > now - 50) {
        cancel = true
    }

    //@ts-expect-error
    player.blockData = [now, brokenBlockPermutation, block.location, blockBroken + 1];

    if (nukerData.has(name) && nukerData.get(name) > now) {
        return;
    }

    //@ts-expect-error
    if (player.blockData.slice(-1)[0] >= 5) {
        world.sendMessage(`§2§l§¶Matrix >§4 ${name}§m has been detected using Nuker`);
        nukerData.set(name, now + 1000);
        player.addTag("break-disable")
        system.runTimeout(() => player.removeTag("break-disable"), 100)
    }

    system.runTimeout(() => {
        //@ts-expect-error
        player.blockData = [now, brokenBlockPermutation, block.location, 0];
        nukerData.delete(name);
    }, 40);
});

world.afterEvents.playerSpawn.subscribe((({ initialSpawn, player }) => {
    if (initialSpawn && player.hasTag("break-disable")) {
        player.removeTag("break-disable")
    }
}))