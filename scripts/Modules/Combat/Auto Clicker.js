"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@minecraft/server");
const Config_js_1 = __importDefault(require("../../Data/Config.js"));
class ClickData {
    clicks;
}
const clickData = new Map();
/**
 * @author ravriv
 * @description This is a simple auto clicker detector.
 * it will detect if the player is clicking more than 22 times per second.
 */
const AutoClicker = (player) => {
    const currentTime = Date.now();
    const { id, name } = player;
    const { clicks } = clickData.get(id) || { clicks: [] };
    const filteredClicks = clicks.filter(clickTime => currentTime - clickTime < 1500);
    filteredClicks.push(currentTime);
    const cps = filteredClicks.length;
    if (cps > Config_js_1.default.antiAutoClicker.maxClicksPerSecond && !player.hasTag("pvp-disabled")) {
        server_1.world.sendMessage(`§2§l§¶Matrix > §4${name}§m has been detected using Auto Clicker\n§r§l§¶Click Per Second:§c ${cps.toFixed(0)}`);
        player.applyDamage(6);
        player.addTag("pvp-disabled");
        server_1.system.runTimeout(() => {
            player.removeTag("pvp-disabled");
            clickData.delete(id);
        }, Config_js_1.default.antiAutoClicker.timeout);
    }
    clickData.set(id, { clicks: filteredClicks });
};
server_1.world.afterEvents.entityHitEntity.subscribe(({ damagingEntity, hitEntity }) => {
    if (!(damagingEntity instanceof server_1.Player) || !(hitEntity instanceof server_1.Player)) {
        return;
    }
    AutoClicker(damagingEntity);
});
