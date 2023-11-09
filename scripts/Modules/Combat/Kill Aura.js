"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@minecraft/server");
const Config_js_1 = __importDefault(require("../../Data/Config.js"));
/**
 * @author ravriv
 * @description This is a simple kill aura detector.
 * it will detect if the player is hitting another player from a impossible angle.
 */
function KillAura(damagingEntity, hitEntity) {
    const direction = calculateVector(damagingEntity.location, hitEntity.location);
    const distance = calculateMagnitude(direction);
    if (distance < 2 || damagingEntity.hasTag("pvp-disabled"))
        return;
    const view = damagingEntity.getViewDirection();
    const angle = calculateAngle(view, direction);
    if (angle > Config_js_1.default.antiKillAura.minAngle) {
        server_1.world.sendMessage(`§2§l§¶Matrix >§4 ${damagingEntity.name}§m has been detected using Kill Aura\n§r§l§¶Angle:§c ${angle.toFixed(2)}°`);
        damagingEntity.addTag("pvp-disabled");
        server_1.system.runTimeout(() => {
            damagingEntity.removeTag("pvp-disabled");
        }, Config_js_1.default.antiKillAura.timeout);
    }
}
function calculateVector(l1, l2) {
    const { x: x1, y: y1, z: z1 } = l1;
    const { x: x2, y: y2, z: z2 } = l2;
    return {
        x: x2 - x1,
        y: y2 - y1,
        z: z2 - z1
    };
}
function calculateMagnitude({ x, y, z }) {
    return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
}
function calculateAngle(v1, v2) {
    const { x: x1, y: y1, z: z1 } = v1;
    const { x: x2, y: y2, z: z2 } = v2;
    const dotProduct = x1 * x2 + y1 * y2 + z1 * z2;
    const m1 = calculateMagnitude(v1);
    const m2 = calculateMagnitude(v2);
    const denominator = m1 * m2;
    if (denominator === 0)
        return 0;
    const radians = Math.acos(dotProduct / denominator);
    const degrees = radians * (180 / Math.PI);
    return degrees;
}
server_1.world.afterEvents.entityHitEntity.subscribe(({ damagingEntity, hitEntity }) => {
    if (!(damagingEntity instanceof server_1.Player) || !(hitEntity instanceof server_1.Player))
        return;
    KillAura(damagingEntity, hitEntity);
});
