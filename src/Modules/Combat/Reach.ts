import {
    world,
    system,
    Player,
    Vector3,
    Entity
} from "@minecraft/server";
import config from "../../Data/Config.js";
import { flag } from "../../Assets/Util.js";

const reachData: Map<Entity, number> = new Map<Entity, number>();

/**
 * @author ravriv
 * @description This is a simple reach detector.
 * it will detect if the player is hitting another player from a long distance.
 */

function calculateDistance(b1: Vector3, b2: Vector3) {
    const { x,z } = b1.velocity()
    const { x1,z1 } = b2.velocity()
    const velocityB1 = Math.abs(x)+Math.abs(z)
    const velocityB2 = Math.abs(x1)+Math.abs(z1)
    const dx: number = b1.x - b2.location.x - velocityB1
    const dz: number = b1.z - b2.location.z- velocityB2

    const distance: number = Math.floor(Math.hypot(dx, dz))-(velocityB1+velocityB2)

    return distance;
}

world.afterEvents.entityHurt.subscribe(({ damagingEntity, hitEntity }) => {
    if (!(damagingEntity instanceof Player) || !(hitEntity instanceof Player)) return;

    const distance: number = calculateDistance(damagingEntity, hitEntity);

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
        flag (damagingEntity, 'Reach', undefined, undefined)
        damagingEntity.applyDamage(6);
        reachData.delete(damagingEntity);
    }
});
