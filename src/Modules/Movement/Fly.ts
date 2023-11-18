import { world, system, GameMode, Player } from "@minecraft/server";
import { flag, isAdmin, checkBlockAround } from "../../Assets/Util";
import config from "../../Data/Config";
import { MinecraftBlockTypes, MinecraftEffectTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";

const previousLocations = new Map();
/**
 * @author RaMiGamerDev & ravriv
 * @description This checks if a player velocity is too high.
 */

async function antiFly (player: Player, now: number) {
    const { id, isOnGround, isFlying, isInWater, isGliding, threwTridentAt, lastExplosionTime } = player;
    const jumpEffect = player.getEffect(MinecraftEffectTypes.JumpBoost)
    const prevLoc = previousLocations.get(id);
    const { x, z, y: velocity } = player.getVelocity();

    const xz = Math.hypot(x, z)

    if (player.hasTag("matrix:knockback") && velocity <= 0) {
        player.removeTag("matrix:knockback")
    }

    if (isFlying || isInWater || isGliding || player.hasTag("matrix:levitating") || (jumpEffect && jumpEffect.amplifier > 2) || (threwTridentAt && now - threwTridentAt < 3000) || (lastExplosionTime && now - lastExplosionTime < 5000)) {
        return;
    }

    if (isOnGround && velocity === 0) {
        previousLocations.set(id, player.location);
    }

    const slimeAround = checkBlockAround(player.location, MinecraftBlockTypes.Slime, player.dimension);

    if (slimeAround === true && xz <= 0.39) {
        player.addTag("matrix:slime");
    }
    if (slimeAround === false && velocity <= 0) {
        player.removeTag("matrix:slime");
    }

    if (prevLoc) {
        if (velocity > config.antiFly.maxVelocityY && !player.hasTag("matrix:slime") && !player.hasTag("matrix:knockback") && !player.isOnGround) {
            player.teleport(prevLoc);
            player.applyDamage(0);
            flag (player, "Fly", config.antiFly.maxVL, config.antiFly.punishment, ["velocityY:" + velocity.toFixed(2)])
        }
    }
}
async function antiNoFall (player: Player, now: number) {
    const { id, isFlying, isOnGround, isInWater, isGliding, threwTridentAt, lastExplosionTime } = player;
    const jumpEffect = player.getEffect(MinecraftEffectTypes.JumpBoost)
    const prevLoc = previousLocations.get(id);
    const { x, y, z } = player.getVelocity();
    const xz = Math.hypot(x, z)

    if (isOnGround || isFlying || isInWater || isGliding || player.hasTag("matrix:levitating") || (jumpEffect && jumpEffect.amplifier > 2) || (threwTridentAt && now - threwTridentAt < 3000) || (lastExplosionTime && now - lastExplosionTime < 5000)) {
        return;
    }

    if (y === 0 && xz > 0.2){
        player.teleport(prevLoc);
        player.applyDamage(0);
        flag (player, "Fly", config.antiFly.maxVL, config.antiFly.punishment, ["velocityY:" + y.toFixed(2), "velocityXZ:" + xz.toFixed(2)])
    }
}

system.runInterval(() => {
    const toggle: boolean = Boolean(world.getDynamicProperty("antiFly")) ?? config.antiFly.enabled;
    if (toggle !== true) return;

    const now = Date.now();
    for (const player of world.getPlayers({ excludeGameModes: [GameMode.spectator] })) {
        if (isAdmin(player)) continue;

        antiFly (player, now)
    }
}, 1);

system.runInterval(() => {
    const toggle: boolean = Boolean(world.getDynamicProperty("antiFly")) ?? config.antiFly.enabled;
    if (toggle !== true) return;

    const now = Date.now();
    for (const player of world.getPlayers({ excludeGameModes: [GameMode.spectator] })) {
        antiNoFall (player, now)
    }
}, 7)