import { system, world } from "@minecraft/server";

const nukerData: Map<string, number> = new Map<string, number>();

/**
 * @author ravriv
 * @description This checks if a player is using Nuker in Minecraft Bedrock.
 * it detects if a player breaks more than 5 blocks.
 */


world.afterEvents.playerBreakBlock.subscribe(({ player, block, brokenBlockPermutation, dimension }) => {
    const now: number = Date.now();
    const { name } = player;
    //@ts-expect-error
    const [blockTime, blockPermutation, blockLocation, blockBroken = 0] = player.blockData || [now, brokenBlockPermutation, block.location];

    if (blockTime > now - 50) {
        dimension.getBlock(blockLocation).setPermutation(blockPermutation);
        dimension.getBlock(block.location).setPermutation(brokenBlockPermutation);

        [blockLocation, block.location].forEach(location => {
            dimension.getEntitiesAtBlockLocation(location)
                .filter(item => item.typeId === "minecraft:item")
                .forEach(item => item.kill());
        });
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
    }

    system.runTimeout(() => {
        //@ts-expect-error
        player.blockData = [now, brokenBlockPermutation, block.location, 0];
        nukerData.delete(name);
    }, 40);
});