import { world } from "@minecraft/server";
import en_US from "./en_US";
import config from "../Config";

let languageNow = "en_US"

const lang: { [key: string]: { [key: string]: string } } = {
    "en_US": en_US
}

world.afterEvents.worldInitialize.subscribe(() => {
    const language = world.getDynamicProperty("matrix:language") as string ?? config.language
    languageNow = language
})

export function changeLanguage (lang: string) {
    languageNow = lang
}

export default function (key: string): string {
    return lang[languageNow][key]
}