import {
	world,
	system,
	Vector3,
	Player,
	EntityDamageCause,
	EntityInventoryComponent,
	ItemEnchantsComponent
} from "@minecraft/server";

import config from "../../Data/Config";
const skipCheck = new Map<string, number>();
const previousLocations = new Map<string, Vector3>();
import {
	flag,
	isAdmin,
	blockAround
} from "../../Assets/Util";
import {
	MinecraftBlockTypes,
	MinecraftEffectTypes,
	MinecraftEnchantmentTypes,
	MinecraftItemTypes
} from "../../node_modules/@minecraft/vanilla-data/lib/index";
/**
 * @author RaMiGamerDev
 * @description This is a simple anti-fly that detects players using Fly Vanilla/CubeGlide/Motion.
 */

async function antiFly(player: Player, now: number) {
	const {
		id
	}: any = player;
	const velocityY: number = player.getVelocity().y;
	const playerPrevPos = previousLocations.get(id);
	if (playerPrevPos === undefined || player.isOnGround && velocityY === 0 || velocityY < 0 && player.location.y < previousLocations.get(id)?.y) {
		previousLocations.set(id, player.location);
	}
	if (skipCheck.get(id) == undefined) {
		skipCheck.set(id, 0)
	}
	if (skipCheck.get(id) > 0) {
		skipCheck.set(id, skipCheck.get(id) - 1)
	}
	if (player.hasTag("matrix:knockback") && velocityY <= 0) {
		player.removeTag("matrix:knockback")
	}

	//@ts-expect-error
	if ((player.threwTridentAt && now - player.threwTridentAt < 2000) || (player.lastExplosionTime && now - player.lastExplosionTime < 2000)) return;
	if (player.hasTag("matrix:knockback") || player.isInWater || player.isGliding || (player.isOnGround && velocityY === 0)) return;

	const jumpBoostEffect = player.getEffect(MinecraftEffectTypes.JumpBoost)?.amplifier ?? 0

	if (jumpBoostEffect >= 4) return;

	const didFindSlime: boolean = blockAround(player, MinecraftBlockTypes.Slime)

	if (didFindSlime == true) {
		player.addTag("matrix:slime")
	} else if (velocityY <= 0) {
		player.removeTag("matrix:slime")
	}

	if (player.hasTag("matrix:trident") && player.hasTag("matrix:using_item")) {
		skipCheck.set(id, 40)
	}
	if (player.hasTag("matrix:trident") && !player.hasTag("matrix:using_item")) {
		player.removeTag(`matrix:trident`)
	}
	if (velocityY > config.antiFly.maxVelocityY && !player.hasTag("matrix:slime")) {
		if (velocityY === Math.abs(velocityY) || skipCheck.get(id) > 0) return;

		const prevLoc = previousLocations.get(id);
		flag(player, "Fly", config.antiFly.maxVL, config.antiFly.punishment, [`velocityY:${velocityY.toFixed(2)}`])
		player.teleport(prevLoc);
	}
}

async function antiNofall(player: Player) {
	const {
		id,
		isOnGround
	}: any = player;
	const velocity: Vector3 = player.getVelocity();
	if (player.isFlying || player.isInWater || player.hasTag("matrix:joined")) return

	if (!isOnGround && velocity.y === 0 && Math.hypot(velocity.x, velocity.z) > 0) {
		const prevLoc = previousLocations.get(id);
		flag(player, "NoFall", config.antiFly.maxVL, config.antiNofall.punishment, ["velocityY:0"])
		player.teleport(prevLoc);
	}
}

system.runInterval(() => {
	const toggle: boolean = (world.getDynamicProperty("antiNofall") ?? config.antiNofall.enabled) as boolean;
	if (toggle !== true) return;

	for (const player of world.getAllPlayers()) {
		if (isAdmin(player)) continue;

		antiNofall(player);
	}
}, 10);

system.runInterval(() => {
	const toggle: boolean = (world.getDynamicProperty("antiFly") ?? config.antiFly.enabled) as boolean;
	if (toggle !== true) return;

	const now = Date.now()

	for (const player of world.getAllPlayers()) {
		if (isAdmin(player)) continue;
		antiFly(player, now)
	}
}, 1)

world.afterEvents.playerLeave.subscribe(({
	playerId
}) => {
	const id = playerId;
	previousLocations.delete(id);
	skipCheck.delete(id);
})

world.afterEvents.playerSpawn.subscribe(({
	player,
	initialSpawn
}) => {
	if (!initialSpawn) return;
	player.addTag("matrix:joined")
	system.runTimeout(() => player.removeTag("matrix:joined"), config.antiFly.skipCheck)
})
world.afterEvents.itemUse.subscribe((event) => {
	const player = event.source
	const getItemInSlot = (player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent).container.getItem(player.selectedSlot)
	if (getItemInSlot === undefined) return;
	const getEnchantment = (getItemInSlot.getComponent(ItemEnchantsComponent.componentId) as ItemEnchantsComponent).enchantments
	if (getItemInSlot.typeId == MinecraftItemTypes.Trident) {
		const checkRipTide = getEnchantment.hasEnchantment(MinecraftEnchantmentTypes.Riptide)

		if (checkRipTide > 0) {
			player.addTag(`matrix:trident`)
		}
	}
})
world.afterEvents.entityHurt.subscribe(({
	hurtEntity,
	damageSource
}) => {
	const player = hurtEntity;
	const damageCause = damageSource.cause;
	if (!(player instanceof Player) || isAdmin(player)) return;

	if (damageCause === EntityDamageCause.entityExplosion) {
		skipCheck.set(player.id, 60)
	}
})
