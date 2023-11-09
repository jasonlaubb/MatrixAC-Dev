"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@minecraft/server");
class PhaseData {
    lastPos;
    lastSafePos;
    lastSolid;
}
;
const phaseData = new Map();
const passableBlocks = new Set(["minecraft:sand", "minecraft:gravel"]);
const isSolidBlock = (block) => Boolean(block?.isSolid && !passableBlocks.has(block.typeId) && !block.typeId.endsWith('_powder'));
/**
 * @author ravriv & jasonlaubb
 * @description This is a simple phase detector, it will detect if the player is inside a block
 */
server_1.system.runInterval(() => {
    server_1.world.getPlayers({ excludeTags: ["admin"], excludeGameModes: [server_1.GameMode['creative'], server_1.GameMode['spectator']] }).forEach(player => {
        const { id, name, location, dimension } = player;
        const { x, y, z } = location;
        const floorPos = { x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) };
        const data = phaseData.get(id) || { lastPos: floorPos, lastSafePos: floorPos, lastSolid: false };
        const headBlock = dimension.getBlock({ x: floorPos.x, y: floorPos.y + 1, z: floorPos.z });
        const bodyBlock = dimension.getBlock(floorPos);
        const isSolid = isSolidBlock(bodyBlock) && isSolidBlock(headBlock);
        if (!isSolid) {
            data.lastSafePos = floorPos;
        }
        data.lastPos = floorPos;
        data.lastSolid = isSolid;
        if (data.lastSolid && isSolid) {
            server_1.world.sendMessage(`§2§l§¶Matrix >§4 ${name}§m has detected using Phase`);
            player.teleport(data.lastSafePos);
        }
        phaseData.set(id, data);
    });
}, 20);
server_1.world.afterEvents.playerLeave.subscribe(event => {
    const playerName = event.playerId;
    phaseData.delete(playerName);
});
