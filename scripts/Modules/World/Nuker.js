"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@minecraft/server");
const nukerData = new Map();
/**
 * @author ravriv
 * @description This checks if a player is using Nuker in Minecraft Bedrock.
 * it detects if a player breaks more than 5 blocks.
 */
server_1.world.afterEvents.playerBreakBlock.subscribe(({ player, block, brokenBlockPermutation, dimension }) => {
    const now = Date.now();
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
        server_1.world.sendMessage(`§2§l§¶Matrix >§4 ${name}§m has been detected using Nuker`);
        nukerData.set(name, now + 1000);
    }
    server_1.system.runTimeout(() => {
        //@ts-expect-error
        player.blockData = [now, brokenBlockPermutation, block.location, 0];
        nukerData.delete(name);
    }, 40);
});
