import {
    world,
    system,
    Vector,
    Vector3,
    Vector2,
    Player,
    Block
} from "@minecraft/server";

/**
 * @author jasonlaubb
 * @description A simple checks for scaffold, it can detect the main clients now
 * This checks check the invalid rotation, angle and postion
 */

const isUnderPlayer = (pos1: Vector3, pos2: Vector3) => {
    const p: Vector3 = { x: Math.floor(pos1.x), y: Math.floor(pos1.y), z: Math.floor(pos1.z) } as Vector3;
    if (p.y - 1 !== pos2.y) return false;
    const offsets: number[] = [-1, 0, 1];
    return offsets.includes(p.x - pos2.x) && offsets.includes(p.z - pos2.z);
}

world.afterEvents.playerPlaceBlock.subscribe(({ block, player }) => {
    const rotation: Vector2 = player.getRotation();
    const pos1: Vector3 = player.location;
    const pos2: Vector3 = { x: block.location.x - 0.5, z: block.location.z - 0.5 } as Vector3;
    const angle: number = calculateAngle(pos1, pos2, rotation);

    if (player.hasTag("place-disabled")) return;

    if (rotation.x % 1 === 0 || rotation.y % 1 === 0) {
        if (Math.abs(rotation.x) !== 90) {
            setBlockToAir(player, block, "Invalid Rotation");
        }

        if (angle > 95 && Vector.distance({ x: pos1.x, y: 0, z: pos1.z }, { x: pos2.x, y: 0, z: pos2.z }) > 1.5 && rotation.x < 78.5) {
            setBlockToAir(player, block, "Invalid Angle");
        }

        if (rotation.x < 34.98 && isUnderPlayer(player.location, block.location)) {
            setBlockToAir(player, block, "Invalid Position");
        }
    }
});

function setBlockToAir(player: Player, block: Block, message: string) {
    const { location: { x, y, z } } = block;
    player.dimension.getBlock({ x, y, z }).setType('air');
    world.sendMessage(`§2§l§¶Matrix >§4 ${player.name}§m has been detected using Scaffold\n§r§l§¶Type:§c ${message}`);
    player.applyDamage(6);
    player.addTag("place-disabled");

    system.runTimeout(() => {
        player.removeTag("place-disabled");
    }, 200);
}

function calculateAngle(pos1:Vector3, pos2: Vector3, rotation: Vector2) {
    const dx: number = pos2.x - pos1.x;
    const dz: number = pos2.z - pos1.z;
    const radToDeg: number = 180 / Math.PI;
    const rawAngle: number = Math.atan2(dz, dx) * radToDeg;
    let adjustedAngle: number = rawAngle - rotation.y - 90;
    adjustedAngle = (adjustedAngle <= -180) ? adjustedAngle + 360 : adjustedAngle;
    return Math.abs(adjustedAngle);
}

world.beforeEvents.playerPlaceBlock.subscribe(event => {
    const { player } = event;

    if (player.hasTag("place-disabled")) {
        event.cancel = true;
    }
});