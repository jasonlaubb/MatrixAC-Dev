export function helpList (p: string): string {
    return [
        `§g${p}help - Show this help message`,
        `§g${p}toggles - Show all module's toggle`,
        `§g${p}toggle <module> <enable/disable>- Toggle a module`
    ].join("\n")
}

export function toggleList (p: string): string {
    let list = []
    for (const module of validModules) {
        list.push(`§g${p}toggle ${module} <enable/disable> - Toggle ${module} module`)
    }
    return list.join("\n")
}

export const validModules: string[] = [
    "antiReach",
    "antiKillAura",
    "antiAutoClicker",
    "antiSpam",
    "antiFly",
    "antiPhase",
    "antiSpeed",
    "antiNuker"
]