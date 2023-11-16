import {
    world,
    Player,
    Block,
    Vector3,
    system
} from "@minecraft/server"
import { flag, isAdmin } from "../../Assets/Util";
import { MinecraftBlockTypes } from "@minecraft/vanilla-data";
import config from "../../Data/Config";

const towerData = new Map<string, Vector3>();
const lastBlockPlace = new Map<string, number>();

async function antiTower (player: Player, block: Block) {
    const towerBlock = towerData.get(player.id)
    const lastTime = lastBlockPlace.get(player.id)

    if (!towerBlock || !lastTime) {
        towerData.set(player.id, block.location)
        lastBlockPlace.set(player.id, Date.now())
        return
    }

    const { x, y, z } = block.location;

    const nearBlock = Math.abs(x - towerBlock.x) <= 1 && Math.abs(z - towerBlock.z) <= 1
    const delay = Date.now() - lastTime
    const { y: velocity } = player.getVelocity()

    if (!player.hasTag("matrix:place-disabled") && player.isJumping && nearBlock && y - towerBlock.y == 1 && delay < config.antiTower.minDelay && velocity > config.antiTower.maxVelocity) {
        block.setType(MinecraftBlockTypes.Air)
        player.addTag("matrix:place-disabled")
        system.runTimeout(() => player.removeTag("matrix:place-disabled"), config.antiTower.timeout)
        flag (player, "Tower", config.antiTower.maxVL, config.antiTower.punishment, ["Delay:" + delay.toFixed(2), "Velocity:" + velocity.toFixed(2)])
    }
}

world.afterEvents.playerPlaceBlock.subscribe(({ player, block }) => {
    const toggle: boolean = (world.getDynamicProperty("antiTower") ?? config.antiTower.enabled) as boolean;
    if (toggle !== true) return;

    if (isAdmin(player)) return;

    antiTower (player, block)
})