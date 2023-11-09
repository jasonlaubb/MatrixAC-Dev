"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@minecraft/server");
const Config_js_1 = __importDefault(require("../../Data/Config.js"));
const reachData = new Map();
/**
 * @author ravriv
 * @description This is a simple reach detector.
 * it will detect if the player is hitting another player from a long distance.
 */
function calculateDistance(b1, b2) {
    const dx = b1.x - b2.x;
    const dy = b1.y - b2.y;
    const dz = b1.z - b2.z;
    const distance = Math.floor(Math.hypot(dx, dy, dz));
    return distance;
}
server_1.world.afterEvents.entityHitEntity.subscribe(({ damagingEntity, hitEntity }) => {
    if (!(damagingEntity instanceof server_1.Player) || !(hitEntity instanceof server_1.Player))
        return;
    const distance = calculateDistance(damagingEntity.location, hitEntity.location);
    if (distance > Config_js_1.default.antiReach.maxReach) {
        if (!reachData.has(damagingEntity)) {
            reachData.set(damagingEntity, 0);
            server_1.system.runTimeout(() => {
                reachData.delete(damagingEntity);
            }, 40);
        }
        reachData.set(damagingEntity, reachData.get(damagingEntity) + 1);
    }
    if (reachData.get(damagingEntity) >= 2) {
        server_1.world.sendMessage(`§2§l§¶Matrix >§4 ${damagingEntity.name}§m has been detected using Reach`);
        damagingEntity.applyDamage(6);
        reachData.delete(damagingEntity);
    }
});
