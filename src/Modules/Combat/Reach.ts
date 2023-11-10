import {
    world,
    system,
    Player,
    Entity
} from "@minecraft/server";
import config from "../../Data/Config.js";
import {
    flag
} from "../../Assets/Util.js";

const reachData: Map <Entity, number> = new Map <Entity,number> ();

/**
 * @author ravriv && RamiGamerDev
 * @description This is a simple reach detector.
 * it will detect if the player is hitting another player from a long distance.
 */

function calculateDistance(b1: Entity, b2: Entity) {
    const {
        x,
        z
    } = b1.getVelocity()
    const {
        x: x1,
        z: z1
    } = b2.getVelocity()
    const velocityB1 = Math.abs(x) + Math.abs(z)
    const velocityB2 = Math.abs(x1) + Math.abs(z1)
    const dx: number = b1.location.x - b2.location.x - velocityB1
    const dz: number = b1.location.z - b2.location.z - velocityB2

    const distance: number = Math.floor(Math.hypot(dx, dz)) - (velocityB1 + velocityB2)

    return distance;
}

world.afterEvents.entityHurt.subscribe(({
    damageSource,
    hurtEntity
}) => {
    if (damageSource.cause !== "entityAttack") return
    const damagingEntity = damageSource.damagingEntity;
    if (!(damagingEntity instanceof Player) || !(hurtEntity instanceof Player)) return;
    const yReach = damagingEntity.location.y - hurtEntity.location.y
    let maximumYReach = 4.8
    if (damagingEntity.isJumping) {
        maximumYReach = 5.8
    }
    if (damagingEntity.location.y > hurtEntity.location.y) {
        maximumYReach = 3.8
    }
    const distance: number = calculateDistance(damagingEntity, hurtEntity);

    if (distance > config.antiReach.maxReach || yReach > maximumYReach) {
        if (!reachData.has(damagingEntity)) {
            reachData.set(damagingEntity, 0);
            system.runTimeout(() => {
                reachData.delete(damagingEntity);
            }, 80);
        }
        reachData.set(damagingEntity, reachData.get(damagingEntity) + 1);
    }

    if (reachData.get(damagingEntity) >= 2) {
        flag(damagingEntity, 'Reach', undefined, undefined)
        damagingEntity.applyDamage(6);
        reachData.delete(damagingEntity);
    }
});
