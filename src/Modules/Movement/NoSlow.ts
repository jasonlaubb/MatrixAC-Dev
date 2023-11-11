import {
    Player,
    system,
    world,
    Effect
} from "@minecraft/server";
import { MinecraftBlockTypes, MinecraftEffectTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
import { flag } from "../../Assets/Util";
import config from "../../Data/Config";

function getSpeedIncrease (speedEffect: Effect | undefined) {
    if (speedEffect === undefined) return 0;
    return (speedEffect?.amplifier + 1) * 0.056;
}

async function antiNoSlow(player: Player) {
    const lastPosition = new Map();
    const playerLocation = player.location;
    const velocity = player.getVelocity();
    const { x: velocityX, z: velocityZ } = velocity

    const headWeb: boolean = player.dimension.getBlock({
        x: Math.floor(player.location.x),
        y: Math.floor(player.location.y) + 1,
        z: Math.floor(player.location.z)
    })?.typeId === MinecraftBlockTypes.Web

    const bodyWeb: boolean = player.dimension.getBlock({
        x: Math.floor(player.location.x),
        y: Math.floor(player.location.y),
        z: Math.floor(player.location.z)
    })?.typeId === MinecraftBlockTypes.Web
    if (!headWeb || !bodyWeb) {
        lastPosition.set(player, playerLocation);
    }

    const playerSpeed: number = Math.hypot(velocityX, velocityZ);

    const limitIncrease = getSpeedIncrease(player.getEffect(MinecraftEffectTypes.Speed));

    if (headWeb === true || bodyWeb === true) {
        if (playerSpeed <= (0.04 + limitIncrease)) {
            lastPosition.set(player, playerLocation);
        } else {
            if (player.getEffect(MinecraftEffectTypes.Speed)) return
            flag (player, "NoSlow", config.antiNoSlow.punishment, [`playerSpeed:${playerSpeed.toFixed(2)}`])
        }
    }
}

system.runInterval(() => {
    const toggle = (world.getDynamicProperty("antiNoSlow") ?? config.antiNoSlow.enabled) as boolean;
    if (toggle !== true) return;

    for (const player of world.getAllPlayers()) {
        antiNoSlow(player);
    }
})