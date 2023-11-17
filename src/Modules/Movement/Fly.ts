import { world, system, GameMode, Player } from "@minecraft/server";
import { flag, isAdmin } from "../../Assets/Util";
import config from "../../Data/Config";
import { MinecraftEffectTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";

const previousLocations = new Map();
const velocityRecorder = new Map();
/**
 * @author RaMiGamerDev & ravriv
 * @description This checks if a player velocity is too high.
 */

async function antiFly (player: Player, now: number) {
    //@ts-expect-error
    const { id, isOnGround, isFlying, isInWater, isGliding, threwTridentAt, lastExplosionTime } = player;
    const jumpEffect = player.getEffect(MinecraftEffectTypes.JumpBoost)
    const prevLoc = previousLocations.get(id);
    const { x, y, z } = player.getVelocity();

    if (isFlying || isInWater || isGliding || player.hasTag("matrix:levitating") || (jumpEffect && jumpEffect.amplifier > 2) || (threwTridentAt && now - threwTridentAt < 3000) || (lastExplosionTime && now - lastExplosionTime < 5000)) {
        return;
    }
    if (isOnGround && y == 0) {
        previousLocations.set(id, player.location);
    }
    if (player.hasTag("matrix:slime") && velocityY <= 0) {
            player.removeTag("matrix:slime");
    }
    if (blockAround(player,"minecraft:slime") == true) {
            player.addTag("matrix:slime");
    }
    if (prevLoc) {
        if (y > 0.7 && player.hasTag("matrix:slime")) {
            player.teleport(prevLoc);
            player.applyDamage(0);
            flag (player, "Fly", config.antiFly.maxVL, config.antiFly.punishment, ["velocityY:" + y.toFixed(2), "velocityXZ:" + xz.toFixed(2)])
        }
    }
}
async function antiFlyA (player: Player, now: number) {
    const { id, isOnGround, isFlying, isInWater, isGliding, threwTridentAt, lastExplosionTime } = player;
    const jumpEffect = player.getEffect(MinecraftEffectTypes.JumpBoost)
    const prevLoc = previousLocations.get(id);
    const { x, y, z } = player.getVelocity();

    if (isFlying || isInWater || isGliding || player.hasTag("matrix:levitating") || (jumpEffect && jumpEffect.amplifier > 2) || (threwTridentAt && now - threwTridentAt < 3000) || (lastExplosionTime && now - lastExplosionTime < 5000)) {
        return;
    }
    if(y == 0){
velocityRecorder.set(id,1)
    }
    if(y != 0){
    velocityRecorder.set(id,0)
    }
    if(velocityRecorder.get(id) == 1){
player.teleport(prevLoc);
player.applyDamage(0);
flag (player, "Fly", config.antiFly.maxVL, config.antiFly.punishment, ["velocityY:" + y.toFixed(2), "velocityXZ:" + xz.toFixed(2)])
    }
}
system.runInterval(() => {
    const toggle: boolean = Boolean(world.getDynamicProperty("antiFly")) ?? config.antiFly.enabled;
    if (toggle !== true) return;

    const now = Date.now();
    for (const player of world.getPlayers({ excludeGameModes: [GameMode.creative, GameMode.spectator] })) {
        if (isAdmin(player)) continue;

        antiFly (player, now)
    }
}, 1);
system.runInterval(() => {
    const toggle: boolean = Boolean(world.getDynamicProperty("antiFly")) ?? config.antiFly.enabled;
    if (toggle !== true) return;

    const now = Date.now();
    for (const player of world.getPlayers({ excludeGameModes: [GameMode.creative, GameMode.spectator] })) {
        antiFlyA(player, now)
    }
 },7)
