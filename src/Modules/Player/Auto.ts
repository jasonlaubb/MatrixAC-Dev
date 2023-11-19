import { world, Player } from "@minecraft/server";
import { flag, isAdmin } from "../../Assets/Util";
import config from "../../Data/Config";

/**
 * @author jasonlaubb
 * @description A simpe auto totem and auto shield detector,
 * which can detect some hackers that use auto totem and auto shield to cheat
 */

async function antiAutoTotem (player: Player) {
    if (player.hasTag("matrix:moving") && player.isOnGround && !player.isJumping && !player.isGliding && !player.hasTag("matrix:riding")) {
        flag (player, "Auto Totem", config.antiAutoTotem.maxVL, config.antiAutoTotem.punishment, ["type:Moving"])
    } else

    if (player.hasTag("matrix:usingItem")) {
        flag (player, "Auto Totem", config.antiAutoTotem.maxVL, config.antiAutoTotem.punishment, ["type:UsingItem"])
    } else

    if (player.hasTag("matrix:container")) {
        flag (player, "Auto Totem", config.antiAutoTotem.maxVL, config.antiAutoTotem.punishment, ["type:Container"])
    }
}

async function antiAutoShield (player: Player) {
    if (player.hasTag("matrix:moving") && player.isOnGround && !player.isJumping && !player.isGliding && !player.hasTag("matrix:riding")) {
        flag (player, "Auto Totem", config.antiAutoTotem.maxVL, config.antiAutoTotem.punishment, ["type:Moving"])
    } else

    if (player.hasTag("matrix:usingItem")) {
        flag (player, "Auto Totem", config.antiAutoTotem.maxVL, config.antiAutoTotem.punishment, ["type:UsingItem"])
    } else

    if (player.hasTag("matrix:container")) {
        flag (player, "Auto Totem", config.antiAutoTotem.maxVL, config.antiAutoTotem.punishment, ["type:Container"])
    }
}

world.afterEvents.dataDrivenEntityTriggerEvent.subscribe(({ id, entity: player }) => {
    if (!(player instanceof Player) || isAdmin (player)) return;
    if (id === "matrix:totem") {
        const toggle: boolean = world.getDynamicProperty("matrix:antiAutoTotem") as boolean ?? config.antiAutoTotem.enabled;
        if (!toggle) return;

        antiAutoTotem(player);
    } else
    
    if (id === "matrix:shield") {
        const toggle: boolean = world.getDynamicProperty("matrix:antiAutoShield") as boolean ?? config.antiAutoTotem.enabled;
        if (!toggle) return;

        antiAutoShield(player);
    }
})