import {
    world,
    system,
    Player,
    Entity,
    EntityDamageCause
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
    const { x: x1, z: z1 } = b1.getVelocity();
    const { x: x2, z: z2 } = b2.getVelocity();

    const velocityB1 = Math.abs(x1) + Math.abs(z1);
    const velocityB2 = Math.abs(x2) + Math.abs(z2);

    const dx: number = b1.location.x - b2.location.x - velocityB1;
    const dz: number = b1.location.z - b2.location.z - velocityB2;

    const distance: number = Math.floor(Math.hypot(dx, dz)) - (velocityB1 + velocityB2);

    return distance;
}

world.afterEvents.entityHurt.subscribe(({ damageSource, hurtEntity }) => {
    if (damageSource.cause !== EntityDamageCause.entityAttack) return
    const damagingEntity = damageSource.damagingEntity;
    if (!(damagingEntity instanceof Player) || !(hurtEntity instanceof Player)) return;
    const yReach: number = Math.abs(damagingEntity.location.y - hurtEntity.location.y)

    let maximumYReach: number = config.antiReach.maxYReach
    
    if (damagingEntity.isJumping) {
        maximumYReach += 1
    }
    
    if (damagingEntity.location.y > hurtEntity.location.y) {
        maximumYReach -= 1
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
        flag(damagingEntity, 'Reach', config.antiReach.punishment, ["distance:" + distance, "yReach:" + yReach])
        damagingEntity.applyDamage(6);
        reachData.delete(damagingEntity);
    }
});
