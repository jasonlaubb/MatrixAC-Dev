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
import lang from "../../Data/Languages/lang"

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
            flag (player, "Illegal Item", 0, config.antiIllegalItem.state.typeCheck.punishment, [lang(">Mode") + ":" + lang(">ItemType"), lang(">typeId") + ":" + item.typeId])
            state = "Unsafe"
            continue
        }

        if (config.antiIllegalItem.state.nameLength.enabled && item.nameTag && item.nameTag?.length > config.antiIllegalItem.state.nameLength.maxItemNameLength) {
            container.setItem(i)
            flag (player, "Illegal Item", 0, config.antiIllegalItem.state.nameLength.punishment, [lang(">Mode") + ":" + lang(">ItemNameLength"), lang(">nameLength") + ":" + item.nameTag?.length])
            state = "Unsafe"
            continue
        }

        if (config.antiIllegalItem.state.itemTag.enabled && (item.getCanPlaceOn().length > config.antiIllegalItem.state.itemTag.maxAllowedTag || item.getCanDestroy().length > config.antiIllegalItem.state.itemTag.maxAllowedTag)) {
            container.setItem(i)
            flag (player, "Illegal Item", 0, config.antiIllegalItem.state.itemTag.punishment, [lang(">Mode") + ":" + lang(">ItemTag")])
            state = "Unsafe"
            continue
        }

        if (config.antiIllegalItem.state.loreCheck.enabled) {
            const lore = item.getLore()
            if (lore.length > 0) {
                container.setItem(i)

                const loreString = lore.join(",")
                flag (player, "Illegal Item", 0, config.antiIllegalItem.state.loreCheck.punishment, [lang(">Mode") + ":" + lang(">ItemLore"), lang(">ItemLore") + ":" + truncateString(loreString)])
                state = "Unsafe"
                continue
            }
        }

        const itemEnchant = item.getComponent(ItemEnchantsComponent.componentId) as ItemEnchantsComponent
        const enchantments = itemEnchant.enchantments

        if (config.antiIllegalItem.state.enchantLevel.enabled || config.antiIllegalItem.state.enchantConflict.enabled) {
            let patchedEnchantment = []
            let mode = lang(">EnchantLevel")
            for (const enchantment of enchantments) {
                if (config.antiIllegalItem.state.enchantLevel.enabled) {
                    const enchantmentType = enchantment.type
                    const enchantmentLevel = enchantment.level

                    if (config.antiIllegalItem.state.enchantLevel.whiteList.includes(enchantmentType.id + ":" + enchantmentLevel)) continue
                    if (enchantmentLevel > enchantmentType.maxLevel || enchantmentLevel <= 0) {
                        patchedEnchantment.push(enchantmentType.id + ":" + enchantmentLevel)
                    }
                }
                if (config.antiIllegalItem.state.enchantConflict.enabled) {
                    const isConflict = enchantments.canAddEnchantment(enchantment)
                    if (isConflict === false) {
                        patchedEnchantment.push(enchantment.type.id + ":" + enchantment.level)
                        mode = lang("EnchantConflict")
                    }
                }
            }
            if (patchedEnchantment.length > 0) {
                flag (player, "Illegal Item", 0, config.antiIllegalItem.state.enchantLevel.punishment, [lang(">Mode") + ":" + mode, ...patchedEnchantment])
                state = "Unsafe"
                container.setItem(i)
                continue
            }
        }

        if (config.antiIllegalItem.state.enchantAble.enabled && [...enchantments].length > 0 && !enchantableItem.includes(item.typeId as MinecraftItemTypes) && !config.antiIllegalItem.state.enchantAble.whiteList.includes(item.typeId)) {
            container.setItem(i)
            flag (player, "Illegal Item", 0, config.antiIllegalItem.state.enchantAble.punishment, [lang(">Mode") + ":" + lang(">ItemEnchantAble"), lang(">typeId") + item.typeId])
            state = "Unsafe"
            continue
        }

        if (config.antiIllegalItem.state.enchantRepeat.enabled && new Set([...enchantments]).size < [...enchantments].length) {
            container.setItem(i)
            flag (player, "Illegal Item", 0, config.antiIllegalItem.state.enchantRepeat.punishment, [lang(">Mode") + ":" + lang(">ItemEnchantRepeat")])
            state = "Unsafe"
            continue
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