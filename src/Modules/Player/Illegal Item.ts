import {
    world,
    system,
    Container,
    Player,
    ItemStack,
    ItemEnchantsComponent,
    EntityInventoryComponent,
    BlockInventoryComponent
} from "@minecraft/server"
import config from "../../Data/Config"
import { flag, isAdmin, isTargetGamemode } from "../../Assets/Util"
import { MinecraftBlockTypes, MinecraftItemTypes } from "../../node_modules/@minecraft/vanilla-data/lib/index"
import enchantableItem from "../../Data/ItemCanEnchant"

/**
 * @author jasonlaubb
 * @description A powerful anti illegal item system to prevent player use illegal item
 */

function ItemCheck (player: Player, container: Container): "Safe" | "Unsafe" {
    if (!config.antiIllegalItem.checkCreativeMode && isTargetGamemode(player, 1)) return "Safe"
    let state: "Safe" | "Unsafe" = "Safe"

    for (let i = 0; i < container.size; i++) {
        const item: ItemStack = container.getItem(i)

        if (item === undefined) continue

        if (config.antiIllegalItem.state.typeCheck.enabled && config.antiIllegalItem.illegalItem.includes(item.typeId)) {
            container.setItem(i)
            flag (player, "Illegal Item", 0, config.antiIllegalItem.state.typeCheck.punishment, ["mode:ItemType", "typeId:" + item.typeId])
            state = "Unsafe"
            continue
        }

        if (config.antiIllegalItem.state.nameLength.enabled && item.nameTag && item.nameTag?.length > config.antiIllegalItem.state.nameLength.maxItemNameLength) {
            container.setItem(i)
            flag (player, "Illegal Item", 0, config.antiIllegalItem.state.nameLength.punishment, ["mode:ItemNameLength", "nameTag:" + item.nameTag])
            state = "Unsafe"
            if (!config.antiIllegalItem.state.nameLength.clearName) continue
        }

        if (config.antiIllegalItem.state.itemTag.enabled && (item.getCanPlaceOn().length > config.antiIllegalItem.state.itemTag.maxAllowedTag || item.getCanDestroy().length > config.antiIllegalItem.state.itemTag.maxAllowedTag)) {
            container.setItem(i)
            flag (player, "Illegal Item", 0, config.antiIllegalItem.state.itemTag.punishment, ["mode:ItemTag"])
            state = "Unsafe"
            if (!config.antiIllegalItem.state.itemTag.clearTag) continue
        }

        if (config.antiIllegalItem.state.loreCheck.enabled) {
            const lore = item.getLore()
            if (lore.length > 0) {
                if (config.antiIllegalItem.state.loreCheck.clearLore) {
                    item.setLore([])
                } else container.setItem(i)

                const loreString = lore.join(",")
                flag (player, "Illegal Item", 0, config.antiIllegalItem.state.loreCheck.punishment, ["mode:ItemLore", "itemLore:" + truncateString(loreString)])
                state = "Unsafe"
                if (!config.antiIllegalItem.state.loreCheck.clearLore) continue
            }
        }

        const itemEnchant = item.getComponent(ItemEnchantsComponent.componentId) as ItemEnchantsComponent
        const enchantments = itemEnchant.enchantments

        if (config.antiIllegalItem.state.enchantLevel.enabled) {
            let patchedEnchantment = []
            for (const enchantment of enchantments) {
                if (config.antiIllegalItem.state.enchantLevel.enabled) {
                    const enchantmentType = enchantment.type
                    const enchantmentLevel = enchantment.level

                    if (config.antiIllegalItem.state.enchantLevel.whiteList.includes(enchantmentType.id + ":" + enchantmentLevel)) continue
                    if (enchantmentLevel > enchantmentType.maxLevel) {
                        patchedEnchantment.push(enchantmentType.id + ":" + enchantmentLevel + " / " + enchantmentType.maxLevel)
                    }
                }
            }
            if (patchedEnchantment.length > 0) {
                flag (player, "Illegal Item", 0, config.antiIllegalItem.state.enchantLevel.punishment, ["mode:ItemEnchantment", ...patchedEnchantment])
                state = "Unsafe"
                container.setItem(i)
                continue
            }
        }

        if (config.antiIllegalItem.state.enchantAble.enabled && [...enchantments].length > 0 && !enchantableItem.includes(item.typeId as MinecraftItemTypes) && !config.antiIllegalItem.state.enchantAble.whiteList.includes(item.typeId)) {
            container.setItem(i)
            flag (player, "Illegal Item", 0, config.antiIllegalItem.state.enchantAble.punishment, ["mode:ItemEnchantAble", "TypeId:" + item.typeId])
            state = "Unsafe"
            if (!config.antiIllegalItem.state.enchantAble.clearEnchantment) continue
        }

        if (config.antiIllegalItem.state.enchantRepeat.enabled && new Set([...enchantments]).size < [...enchantments].length) {
            if (config.antiIllegalItem.state.enchantRepeat.clearEnchantment) {
                [...enchantments].forEach(enc => enchantments.removeEnchantment(enc.type))
            } else container.setItem(i)

            flag (player, "Illegal Item", 0, config.antiIllegalItem.state.enchantRepeat.punishment, ["mode:ItemEnchantRepeat"])
            state = "Unsafe"
            if (!config.antiIllegalItem.state.enchantRepeat.clearEnchantment) continue
        }
    }

    return state
}

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const toggle: boolean = Boolean(world.getDynamicProperty("antiIllegalItem")) ?? config.antiIllegalItem.enabled
        if (toggle !== true || isAdmin(player)) continue

        const container: Container = (player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent).container
        ItemCheck (player, container)
    }
}, 20)

world.afterEvents.playerPlaceBlock.subscribe(event => {
    const toggle: boolean = Boolean(world.getDynamicProperty("antiIllegalItem")) ?? config.antiIllegalItem.enabled
    const { player, block } = event

    if (toggle !== true || isAdmin(player) || player.hasTag("matrix:place-disabled")) return

    const container: Container = (block.getComponent(BlockInventoryComponent.componentId) as BlockInventoryComponent)?.container
    if (container === undefined) return;

    const checkingState = ItemCheck (player, container)

    if (checkingState === "Unsafe") {
        block.setType(MinecraftBlockTypes.Air)
        player.addTag("matrix:place-disabled")
        system.runTimeout(() => player.removeTag("matrix:place-disabled"), config.antiIllegalItem.timeout)
    }
})

function truncateString(str: string) {
    if (str.length <= 8) {
        return str;
    } else {
        return str.slice(0, 8) + "...";
    }
}