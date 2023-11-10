import * as Util from "./Util";
import {
    Player
} from "@minecraft/server";

/**
 * @author jasonlaubb
 * @description The base of all modules
 */

class Module {
    //value
    moduleName: string;
    punishment: string;

    //constructor
    constructor (
        moduleName: string,
        punishment: string
    ) {
        this.moduleName = moduleName
        this.punishment = punishment
    }

    //dynamic method
    flag (player: Player, infomation?: string[] | undefined, otherPunishment?: string | undefined) {
        const punishment: string = otherPunishment ?? this.punishment
        const infomations: string[] | undefined = infomation
        const moduleName: string = this.moduleName

        Util.flag (player, moduleName, punishment, infomations)
    }

    //static method
    static isTargetGamemode (player: Player, gamemode: number) {
        Util.isTargetGamemode(player, gamemode)
    }
    static kick (player: Player, reason?: string, by?: string) {
        Util.kick (player, reason, by)
    }
}

export { Module }