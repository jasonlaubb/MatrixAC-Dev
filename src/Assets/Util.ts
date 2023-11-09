import {
    world,
    Player
} from "@minecraft/server"

export function kick (player: Player, reason?: string, by?: string) {
    player.runCommand(`kick "${player.name}" \n§2§l§¶Matrix >§4 ${player.name} §mYou have been kicked\n§fReason: §c${reason ?? 'No reason provided'}\n§fBy: §c${by ?? 'Unknown'}`)
}

function formatInformation (arr: string[]) {
    const formattedArr: string[] = arr.map(item => {
      const [key, value] = item.split(":");
      return `§l§¶${key}:§c ${value}`;
    });
    return formattedArr.join("\n");
}
export function flag (player: Player, modules: string, punishment?: string, infos?: string[]) {
    world.sendMessage(`§2§l§¶Matrix >§4 ${player.name}§m has been detected using ${modules}`);
    if (infos !== undefined) {
        world.sendMessage(`${formatInformation(infos)}`)
    }

    if (punishment !== undefined) {
        switch (punishment) {
            case "kick": {
                kick (player, 'Unfair advantage', 'Matrix')
                break
            }
            default: {
                //nothing here :p
            }
        }
    }
}