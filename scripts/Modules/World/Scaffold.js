"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@minecraft/server");
/**
 * @author jasonlaubb
 * @description A simple checks for scaffold, it can detect the main clients now
 * This checks check the invalid rotation, angle and postion
 */
const isUnderPlayer = (pos1, pos2) => {
    const p = { x: Math.floor(pos1.x), y: Math.floor(pos1.y), z: Math.floor(pos1.z) };
    if (p.y - 1 !== pos2.y)
        return false;
    const offsets = [-1, 0, 1];
    return offsets.includes(p.x - pos2.x) && offsets.includes(p.z - pos2.z);
};
server_1.world.afterEvents.playerPlaceBlock.subscribe(({ block, player }) => {
    const rotation = player.getRotation();
    const pos1 = player.location;
    const pos2 = { x: block.location.x - 0.5, z: block.location.z - 0.5 };
    const angle = calculateAngle(pos1, pos2, rotation);
    if (player.hasTag("place-disabled"))
        return;
    if (rotation.x % 1 === 0 || rotation.y % 1 === 0) {
        if (Math.abs(rotation.x) !== 90) {
            setBlockToAir(player, block, "Invalid Rotation");
        }
        if (angle > 95 && server_1.Vector.distance({ x: pos1.x, y: 0, z: pos1.z }, { x: pos2.x, y: 0, z: pos2.z }) > 1.5 && rotation.x < 78.5) {
            setBlockToAir(player, block, "Invalid Angle");
        }
        if (rotation.x < 34.98 && isUnderPlayer(player.location, block.location)) {
            setBlockToAir(player, block, "Invalid Position");
        }
    }
});
function setBlockToAir(player, block, message) {
    const { location: { x, y, z } } = block;
    player.dimension.getBlock({ x, y, z }).setType('air');
    server_1.world.sendMessage(`§2§l§¶Matrix >§4 ${player.name}§m has been detected using Scaffold\n§r§l§¶Type:§c ${message}`);
    player.applyDamage(6);
    player.addTag("place-disabled");
    server_1.system.runTimeout(() => {
        player.removeTag("place-disabled");
    }, 200);
}
function calculateAngle(pos1, pos2, rotation) {
    const dx = pos2.x - pos1.x;
    const dz = pos2.z - pos1.z;
    const radToDeg = 180 / Math.PI;
    const rawAngle = Math.atan2(dz, dx) * radToDeg;
    let adjustedAngle = rawAngle - rotation.y - 90;
    adjustedAngle = (adjustedAngle <= -180) ? adjustedAngle + 360 : adjustedAngle;
    return Math.abs(adjustedAngle);
}
server_1.world.beforeEvents.playerPlaceBlock.subscribe(event => {
    const { player } = event;
    if (player.hasTag("place-disabled")) {
        event.cancel = true;
    }
});
