import {
    world,
    system,
    Player,
    Vector3,
    Entity
} from "@minecraft/server";
import config from "../../Data/Config.js";

const reachData: Map<Entity, number> = new Map<Entity, number>();

/**
 * @author ravriv
 * @description This is a simple reach detector.
 * it will detect if the player is hitting another player from a long distance.
 */

function calculateDistance(b1: Vector3, b2: Vector3) {
    const dx: number = b1.x - b2.x;
    const dy: number = b1.y - b2.y;
    const dz: number = b1.z - b2.z;

    const distance: number = Math.floor(Math.hypot(dx, dy, dz));

    return distance;
}

world.afterEvents.entityHitEntity.subscribe(({ damagingEntity, hitEntity }) => {
    if (!(damagingEntity instanceof Player) || !(hitEntity instanceof Player)) return;

    const distance: number = calculateDistance(damagingEntity.location, hitEntity.location);

    if (distance > config.antiReach.maxReach) {
        if (!reachData.has(damagingEntity)) {
            reachData.set(damagingEntity, 0);
            system.runTimeout(() => {
                reachData.delete(damagingEntity);
            }, 40);
        }
        reachData.set(damagingEntity, reachData.get(damagingEntity) + 1);
    }

    if (reachData.get(damagingEntity) >= 2) {
        world.sendMessage(`§2§l§¶Matrix >§4 ${damagingEntity.name}§m has been detected using Reach`);
        damagingEntity.applyDamage(6);
        reachData.delete(damagingEntity);
    }
});