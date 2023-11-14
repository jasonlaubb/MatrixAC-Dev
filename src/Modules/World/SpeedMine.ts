import {
	system,
	GameMode,
	world,
	EntityInventoryComponent,
	ItemEnchantsComponent,
	EnchantmentList,
	ItemStack,
	Player,
	Block,
	PlayerBreakBlockBeforeEvent
} from "@minecraft/server"

import fastBrokenBlocks from "../../Data/FastBrokenBlocks";
import {
	MinecraftBlockTypes,
	MinecraftEffectTypes,
	MinecraftEnchantmentTypes
} from "../../node_modules/@minecraft/vanilla-data/lib/index";
import {
	flag,
	isAdmin
} from "../../Assets/Util";
import config from "../../Data/Config";

const toolsNames = [
	"minecraft:netherite_hoe", "minecraft:golden_hoe", "minecraft:diamond_hoe",
	"minecraft:netherite_pickaxe", "minecraft:golden_pickaxe", "minecraft:diamond_pickaxe",
	"minecraft:netherite_axe", "minecraft:golden_axe", "minecraft:diamond_axe", "minecraft:netherite_shovel",
	"minecraft:golden_shovel", "minecraft:diamond_shovel", "minecraft:iron_pickaxe", "minecraft:iron_axe",
	"minecraft:iron_hoe", "minecraft:iron_pickaxe", "minecraft:shears"
]
const stoneTools = ["minecraft:stone_hoe", "minecraft:stone_shovel", "minecraft:stone_axe", "minecraft:stone_pickaxe"]
const woodTools = ["minecraft:wooden_hoe", "minecraft:wooden_shovel", "minecraft:wooden_axe", "minecraft:wooden_pickaxe"]

const breakTimer = new Map <string,number> ()

class MineData {
	mineFlags: {
		[key: string]: number
	}
	mineTimer: {
		[key: string]: number
	}
}
let mineData: MineData = {
	mineFlags: {},
	mineTimer: {},
}

const isGMC = (playerName: string) => world.getPlayers({
	gameMode: GameMode.creative,
	name: playerName
}).length > 0

/**
 * @author RaMiGamerDev
 * @description A simple checks for speed mine, it checks for high breaking speed of players
 */

async function antiSpeedMine(player: Player, block: Block, event: PlayerBreakBlockBeforeEvent) {
	const container = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent).container;
	const item: ItemStack = container.getItem(player.selectedSlot)
	let enchantment: EnchantmentList | undefined;
	let efficiency: boolean | undefined;

	if (item === undefined) {
		enchantment = undefined;
		efficiency = false;
	} else {
		enchantment = (item.getComponent(ItemEnchantsComponent.componentId) as ItemEnchantsComponent)?.enchantments;
		efficiency = Boolean(enchantment.hasEnchantment(MinecraftEnchantmentTypes.Efficiency));
	}

	const timer: number = breakTimer.get(player.id) ?? 0
	const mineFlags: number = mineData.mineFlags[player.id] ?? 0
	const mineTimer: number = mineData.mineTimer[player.id] ?? 0

	let breakSpeed: number = 20

	if (toolsNames.includes(item?.typeId)) {
		breakSpeed = 4
	}
	if (stoneTools.includes(item?.typeId)) {
		breakSpeed = 10
	}
	if (woodTools.includes(item?.typeId)) {
		breakSpeed = 13
	}

	if (efficiency === true || player.getEffect(MinecraftEffectTypes.Haste) || fastBrokenBlocks.has(block.typeId as MinecraftBlockTypes)) {
		breakSpeed = 0
	}

	if (breakTimer.get(player.id) < 1) {
		if (fastBrokenBlocks.has(block.typeId as MinecraftBlockTypes)) return
		system.run(() => {
			mineData.mineFlags[player.id] = 0
			mineData.mineTimer[player.id] = breakSpeed
		})
	}
	if (timer > 0) {
		event.cancel = true
		mineData.mineFlags[player.id]++;
	}
	if (mineFlags > 4) {
		system.run(() => {
			if (mineTimer >= 2 || timer > breakSpeed || breakSpeed == 0 || fastBrokenBlocks.has(block.typeId as MinecraftBlockTypes) || isGMC(player.name)) return
			event.cancel = true
			mineData.mineFlags[player.id] = 0
			flag(player, 'Speed Mine', config.antiSpeedMine.maxVL, config.antiSpeedMine.punishment, [`Blocks:${mineFlags} BPS`])
		})
	}
}

world.beforeEvents.playerBreakBlock.subscribe((event) => {
	const { player, block } = event;

	const toggle: boolean = (world.getDynamicProperty("antiSpeedMine") ?? config.antiSpeedMine.enabled) as boolean;

	if (!toggle || isAdmin(player)) return

	antiSpeedMine(player, block, event)
})

world.afterEvents.playerLeave.subscribe(({ playerId }) => {
    breakTimer.delete(playerId)
    delete mineData.mineFlags[playerId]
    delete mineData.mineTimer[playerId]
})
