import {
    world,
    system,
    Block,
    Vector3,
    GameMode
} from "@minecraft/server";
import { flag } from "../../Assets/Util";

class PhaseData {
    lastPos: Vector3;
    lastSafePos: Vector3;
    lastSolid: boolean;
};

const phaseData: Map<string, PhaseData> = new Map<string, PhaseData>();
const passableBlocks = new Set(["minecraft:sand", "minecraft:gravel"]);
const isSolidBlock = (block: Block) => Boolean(block?.isSolid && !passableBlocks.has(block.typeId) && !block.typeId.endsWith('_powder'));

/**
 * @author ravriv & jasonlaubb
 * @description This is a simple phase detector, it will detect if the player is inside a block
 */

system.runInterval(() => {
    world.getPlayers({ excludeTags: ["admin"], excludeGameModes: [GameMode['creative'], GameMode['spectator']] }).forEach(player => {
        const { id, location, dimension } = player;
        const { x, y, z } = location;
        const floorPos: Vector3 = { x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) };
        const data: PhaseData = phaseData.get(id) || { lastPos: floorPos, lastSafePos: floorPos, lastSolid: false };

        const headBlock: Block = dimension.getBlock({ x: floorPos.x, y: floorPos.y + 1, z: floorPos.z });
        const bodyBlock: Block = dimension.getBlock(floorPos);

        const isSolid: boolean = isSolidBlock(bodyBlock) && isSolidBlock(headBlock);

        if (!isSolid) {
            data.lastSafePos = floorPos;
        }

        data.lastPos = floorPos;
        data.lastSolid = isSolid;

        if (data.lastSolid && isSolid) {
            flag (player, 'Phase', undefined, undefined)
            player.teleport(data.lastSafePos);
        }

        phaseData.set(id, data);
    });
}, 20);

world.afterEvents.playerLeave.subscribe(event => {
    const playerName: string = event.playerId;
    phaseData.delete(playerName);
});