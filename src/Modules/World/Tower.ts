import { world, system, Player, Block } from "@minecraft/server";
import { flag, isAdmin } from "../../Assets/Util";
import { MinecraftBlockTypes, MinecraftEffectTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index";
import config from "../../Data/Config";
const towerData = new Map();
const lastBlockPlace = new Map();

/**
 * @author jasonlaubb
 * @description A anti tower module that can detect tower-hack with a very low false positive rate
 * It work by patching a very small delay between player towering and with a high velocity
 */

async function antiTower(player: Player, block: Block) {
    const towerBlock = towerData.get(player.id);
    const lastTime = lastBlockPlace.get(player.id);
    towerData.set(player.id, block.location);
    lastBlockPlace.set(player.id, Date.now());
    if (!towerBlock || !lastTime) {
        return;
    }
    if (player.hasTag("matrix:place-disabled") || player.isOnGround || !player.isJumping || player.isFlying || player.isInWater || player.getEffect(MinecraftEffectTypes.JumpBoost))
        return;
    const { x, y, z } = block.location;
    const towerNearBlock = x === towerBlock.x && z === towerBlock.z;
    const playerCentreDis = Math.hypot(player.location.x - x + 0.5, player.location.z - z + 0.5);
    const playerNearBlock = playerCentreDis > 0.41 && playerCentreDis < 2.5;
    const playerPosDeff = player.location.y - y;
    const playerTowering = playerPosDeff < 0.4 && y - towerBlock.y == 1;
    const locationState = playerTowering && towerNearBlock && playerNearBlock;
    const delay = Date.now() - lastTime;
    if (delay < config.antiTower.minDelay && locationState) {
        block.setType(MinecraftBlockTypes.Air);
        player.addTag("matrix:place-disabled");
        system.runTimeout(() => player.removeTag("matrix:place-disabled"), config.antiTower.timeout);
        flag(player, "Tower", config.antiTower.maxVL, config.antiTower.punishment, ["Delay:" + delay.toFixed(2), "PosDeff:" + playerPosDeff.toFixed(2), "CentreDis:" + playerCentreDis.toFixed(2)]);
    }
}
world.afterEvents.playerPlaceBlock.subscribe(({ player, block }) => {
    const toggle = (world.getDynamicProperty("antiTower") ?? config.antiTower.enabled);
    if (toggle !== true)
        return;
    if (isAdmin(player))
        return;
    antiTower(player, block);
});
world.afterEvents.playerLeave.subscribe(({ playerId }) => {
    towerData.delete(playerId);
    lastBlockPlace.delete(playerId);
});