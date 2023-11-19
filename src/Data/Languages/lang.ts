import { world } from "@minecraft/server";
import en_US from "./en_US";
import config from "../Config";
import zh_TW from "./zh_TW";

let languageNow = "en_US"

export const langs: { [key: string]: { [key: string]: string } } = {
    "en_US": en_US,
    "zh_TW": zh_TW
}

world.afterEvents.worldInitialize.subscribe(() => {
    const language = world.getDynamicProperty("matrix:language") as string ?? config.language
    languageNow = language
})

export function changeLanguage (lang: string) {
    if (Object.keys(langs).includes(lang)) {
        languageNow = lang
        return true
    }
    return false
}
export const getAllLang = () => Object.keys(langs)

export default function (key: string): string {
    return langs[languageNow][key]
}