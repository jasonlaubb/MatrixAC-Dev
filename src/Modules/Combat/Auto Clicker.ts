import {
    world,
    system,
    Player
} from "@minecraft/server";
import config from "../../Data/Config.js";

class ClickData {
    clicks: number[]
}

const clickData: Map<string, ClickData> = new Map<string, ClickData>();

/**
 * @author ravriv
 * @description This is a simple auto clicker detector.
 * it will detect if the player is clicking more than 22 times per second.
 */

const AutoClicker = (player: Player) => {
    const currentTime: number = Date.now();
    const { id, name } = player;
    const { clicks } = clickData.get(id) || { clicks: [] };

    const filteredClicks: number[] = clicks.filter(clickTime => currentTime - clickTime < 1500);
    filteredClicks.push(currentTime);

    const cps: number = filteredClicks.length;

    if (cps > config.antiAutoClicker.maxClicksPerSecond && !player.hasTag("pvp-disabled")) {
        world.sendMessage(`§2§l§¶Matrix > §4${name}§m has been detected using Auto Clicker\n§r§l§¶Click Per Second:§c ${cps.toFixed(0)}`);
        player.applyDamage(6);
        player.addTag("pvp-disabled");

        system.runTimeout(() => {
            player.removeTag("pvp-disabled");
            clickData.delete(id);
        }, config.antiAutoClicker.timeout);
    }

    clickData.set(id, { clicks: filteredClicks });
};

world.afterEvents.entityHitEntity.subscribe(({ damagingEntity, hitEntity }) => {
    if (!(damagingEntity instanceof Player) || !(hitEntity instanceof Player)) {
        return;
    }
    AutoClicker(damagingEntity);
});