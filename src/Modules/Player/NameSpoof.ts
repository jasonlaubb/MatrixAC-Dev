import { world, Player } from "@minecraft/server";
import { flag, isAdmin } from "../../Assets/Util";
import config from "../../Data/Config";

/**
 * @author jasonlaubb
 * @description This check can detect players with illegal names
 * It basically checks if the player name contains any non-ASCII characters or invalid length
 */

async function antiNameSpoof (player: Player, playerName: string) {
    if (playerName.length < 3 || playerName.length > 16) {
        flag (player, "NameSpoof", 0, config.antiNameSpoof.punishment, ["type:illegalLength", "length:" + playerName.length])
        return
    }

    const nonASCII = playerName.match(/[^\x00-\x7F]/g);

    if (nonASCII.length > 0) {
        let illegalName = false;
        for (let i = 0; i < nonASCII.length; i++) {
            const regax = nonASCII[i];
            if (/[\u4E00-\u9FFF\uAC00-\uD7AF\u3040-\u30FF]/.test(regax) === false && !/[^\d_]/.test(regax) && !/[().&*]/.test(regax)) {
                illegalName = true;
                break
            }
        }

        if (illegalName === true) {
            flag (player, "NameSpoof", 0, config.antiNameSpoof.punishment, ["type:illegalRegax"])
        }
    }
}

world.afterEvents.playerSpawn.subscribe(({ player }): any => {
    const toggle: boolean = (world.getDynamicProperty("antiNameSpoof") ?? config.antiNameSpoof.enabled) as boolean;
    if (toggle !== true || isAdmin(player)) return

    antiNameSpoof (player, player.name)
})