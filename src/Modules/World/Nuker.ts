import {
    Block,
    Player,
    system,
    world
} from "@minecraft/server";
import { flag, isAdmin } from "../../Assets/Util";
import config from "../../Data/Config";
import { MinecraftBlockTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
import fastBrokenBlocks from "../../Data/FastBrokenBlocks";

const blockBreakData = new Map<string, number[]>();

/**
 * @author jasonlaubb
 * @description This checks if a player is using Nuker in Minecraft Bedrock.
 * it detects if a player breaks more than 5 blocks in a tick.
 */

async function antiNuker (player: Player, block: Block) {
    if (player.hasTag("matrix:break-disabled")) return;

    const timeNow = Date.now();

    //get the block break count in the 1 tick
    let blockBreakCount: number[] = blockBreakData.get(player.id)?.filter(time => timeNow - time < 50) ?? [];

    if (!fastBrokenBlocks.has(block.typeId as MinecraftBlockTypes)) {
        blockBreakCount.push(Date.now());
    };

    blockBreakData.set(player.id, blockBreakCount);

    if (blockBreakCount.length > config.antiNuker.maxBreakPerTick) {
        player.addTag("matrix:break-disabled");
        block.dimension.getEntities({ location: block.location, maxDistance: 2, minDistance: 0, type: "minecraft:item" }).forEach((item) => { item.kill() })
        block.setPermutation(block.permutation.clone())

        //prevent the player from breaking blocks for 3 seconds
        system.runTimeout(() => player.removeTag("matrix:break-disabled"), config.antiNuker.timeout);

        blockBreakData.delete(player.id);
        flag(player, "Nuker", config.antiNuker.maxVL,config.antiNuker.punishment, ["block:" + block.typeId.replace("minecraft:","")]);
    }
}

world.afterEvents.playerBreakBlock.subscribe((event) => {
    const toggle: boolean = (world.getDynamicProperty("antiNuker") ?? config.antiNuker.enabled) as boolean;
    if (toggle !== true) return;

    const { player, block } = event;
    if (isAdmin (player)) return;

    antiNuker (player, block)
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
    const { player, block } = event

    if (player.hasTag("matrix:break-disabled")) {
        block.dimension.getEntities({ location: block.location, maxDistance: 2, minDistance: 0, type: "minecraft:item" }).forEach((item) => { item.kill() })
        block.setPermutation(block.permutation.clone())
    }
})

world.beforeEvents.playerBreakBlock.subscribe((event) => {
    const { player } = event
    if (player.hasTag("matrix:break-disabled")) {
        event.cancel = true
    }
})

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    if (!initialSpawn) return;
    player.removeTag("matrix:break-disabled");
})

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
    blockBreakData.delete(playerId);
})
