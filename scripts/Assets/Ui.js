"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unfreezeMenu = exports.freezeMenu = exports.unmuteMenu = exports.muteMenu = exports.unbanMenu = exports.banMenu = exports.participantsMenu = exports.playersMenu = exports.commandsMenu = exports.settingsMenu = exports.mainMenu = void 0;
const server_1 = require("@minecraft/server");
const server_ui_1 = require("@minecraft/server-ui");
/**
 * @author ravriv & jasonlaubb
 * @description The Matrix's ui system
 */
class Setting {
    scoreboard;
}
const settings = [
    { name: "Anti Fly", scoreboard: "mac:anti-fly-enabled" },
    { name: "Anti Speed", scoreboard: "mac:anti-speed-enabled" },
    { name: "Anti Scaffold", scoreboard: "mac:anti-scaffold-enabled" },
    { name: "Anti Auto Clicker", scoreboard: "mac:anti-autoclicker-enabled" },
    { name: "Anti Kill Aura", scoreboard: "mac:anti-killaura-enabled" },
    { name: "Anti Spam", scoreboard: "mac:anti-spam-enabled" },
    { name: "Death Coordinates", scoreboard: "mac:death-coordinates-enabled" },
];
function toggleSetting(setting, isSettingEnabled) {
    const checkSettings = server_1.world.scoreboard.getObjective(setting.scoreboard) !== undefined;
    if (isSettingEnabled && !checkSettings)
        server_1.world.scoreboard.addObjective(setting.scoreboard, "dummy");
    if (!isSettingEnabled && checkSettings)
        server_1.world.scoreboard.removeObjective(setting.scoreboard);
}
function checkScoreboardObjective() {
    const objectivesToCheck = ["mac:banList", "mac:muteList", "mac:frozenList"];
    for (const objective of objectivesToCheck) {
        if (!server_1.world.scoreboard.getObjective(objective)) {
            server_1.world.scoreboard.addObjective(objective, "dummy");
        }
    }
}
function mainMenu(player) {
    checkScoreboardObjective();
    new server_ui_1.ActionFormData()
        .title(`Matrix Anti Cheat`)
        .button("§l§¶Settings", "textures/ui/settings_glyph_color_2x.png")
        .button("§l§¶Commands", "textures/ui/creator_glyph_color.png")
        .button("§l§¶Exit", "textures/ui/cancel.png")
        .show(player)
        .then(res => {
        if (!res.canceled) {
            if (res.selection === 0)
                settingsMenu(player);
            if (res.selection === 1)
                commandsMenu(player);
        }
    });
}
exports.mainMenu = mainMenu;
function settingsMenu(player) {
    const form = new server_ui_1.ModalFormData().title("Settings");
    settings.forEach(setting => form.toggle(setting.name, server_1.world.scoreboard.getObjective(setting.scoreboard) !== undefined));
    form.show(player)
        .then(res => {
        if (res.canceled)
            player.sendMessage("§l§uOAC§r >§c Settings Discard Changes!");
        else
            settings.forEach((setting, index) => toggleSetting(setting, res.formValues[index]));
        mainMenu(player);
    });
}
exports.settingsMenu = settingsMenu;
function commandsMenu(player) {
    const form = new server_ui_1.ActionFormData()
        .title("Commands")
        .button("§l§¶Ban Player", "textures/blocks/barrier.png")
        .button("§l§¶Unban Player", "textures/ui/confirm.png")
        .button("§l§¶Mute Player", "textures/ui/mute_on.png")
        .button("§l§¶Unmute Player", "textures/ui/mute_off.png")
        .button("§l§¶Freeze Player", "textures/ui/icon_winter.png")
        .button("§l§¶Unfreeze Player", "textures/ui/speed_effect.png")
        .button("§l§¶Back", "textures/ui/arrow_l_default.png");
    form.show(player).then(res => {
        if (res.canceled || res.selection === 6)
            return mainMenu(player);
        if (res.selection === 0)
            playersMenu(player, banMenu);
        if (res.selection === 1)
            participantsMenu(player, unbanMenu, "mac:banList");
        if (res.selection === 2)
            playersMenu(player, muteMenu);
        if (res.selection === 3)
            participantsMenu(player, unmuteMenu, "mac:muteList");
        if (res.selection === 4)
            playersMenu(player, freezeMenu);
        if (res.selection === 5)
            participantsMenu(player, unfreezeMenu, "mac:frozenList");
    });
}
exports.commandsMenu = commandsMenu;
function playersMenu(player, action) {
    const form = new server_ui_1.ActionFormData().title("Player Selection");
    const players = [...server_1.world.getPlayers({ excludeTags: ["admin"] })];
    players.forEach(plr => {
        form.button(plr.name, "textures/ui/permissions_member_star.png");
    });
    form.button("Back", "textures/ui/arrow_l_default.png");
    form.show(player).then(res => {
        if (!res.canceled)
            commandsMenu(player);
        if (players[res.selection])
            action(player, players[res.selection]);
    });
}
exports.playersMenu = playersMenu;
function participantsMenu(player, action, objectiveName) {
    const form = new server_ui_1.ActionFormData().title("Player Selection");
    const participants = server_1.world.scoreboard.getObjective(objectiveName).getParticipants();
    participants.forEach(participant => {
        form.button(participant.displayName, "textures/ui/permissions_member_star.png");
    });
    form.button("Back", "textures/ui/arrow_l_default.png");
    form.show(player).then(res => {
        if (!res.canceled)
            commandsMenu(player);
        if (participants[res.selection]) {
            const selectedPlayer = participants[res.selection].displayName;
            action(player, selectedPlayer);
        }
    });
}
exports.participantsMenu = participantsMenu;
function banMenu(player, selectedPlayer) {
    const form = new server_ui_1.ModalFormData()
        .title(`Ban Player: ${selectedPlayer.name}`)
        .textField("§l§¶Reason", "§7§l§o§¶Type Here");
    form.show(player).then((res) => {
        if (res.canceled)
            return;
        const reason = String(res.formValues[0]) ?? "";
        const reasonText = reason ? `\n§r§l§c§¶Reason:§r§l§¶ ${reason}` : "";
        player.runCommandAsync(`scoreboard players add "${selectedPlayer.name}" mac:banList 1`);
        player.runCommandAsync(`kick "${selectedPlayer.name}" §l§c§¶You are banned from this server!${reasonText}\n§r§l§c§¶By:§r§l§¶ ${player.name}`);
        server_1.world.sendMessage(`§2MAC >§c ${selectedPlayer.name} has been banned${reasonText}`);
    });
}
exports.banMenu = banMenu;
function unbanMenu(player, selectedPlayer) {
    const form = new server_ui_1.ModalFormData()
        .title(`Unban Player: ${selectedPlayer}`)
        .textField("§l§¶Reason", "§7§l§o§¶Type Here");
    form.show(player).then(res => {
        if (res.canceled)
            return;
        const reason = String(res.formValues[0]) ?? "";
        const reasonText = reason ? `\n§r§l§c§¶Reason:§r§l§¶ ${reason}` : "";
        player.runCommandAsync(`scoreboard players reset "${selectedPlayer}" mac:banList`);
        server_1.world.sendMessage(`§2MAC >§a ${selectedPlayer} has been unbanned${reasonText}`);
    });
}
exports.unbanMenu = unbanMenu;
function muteMenu(player, selectedPlayer) {
    const form = new server_ui_1.ModalFormData()
        .title(`Mute Player: ${selectedPlayer.name}`)
        .textField("§l§¶Reason", "§7§l§o§¶Type Here");
    form.show(player).then(res => {
        if (res.canceled)
            return;
        const reason = String(res.formValues[0]) ?? "";
        const reasonText = reason ? `\n§r§l§c§¶Reason:§r§l§¶ ${reason}` : "";
        player.runCommandAsync(`scoreboard players add "${selectedPlayer.name}" mac:muteList 1`);
        server_1.world.sendMessage(`§2MAC >§c ${selectedPlayer.name} has been muted${reasonText}`);
    });
}
exports.muteMenu = muteMenu;
function unmuteMenu(player, selectedPlayer) {
    const form = new server_ui_1.ModalFormData()
        .title(`Unmute Player: ${selectedPlayer}`)
        .textField("§l§¶Reason", "§7§l§o§¶Type Here");
    form.show(player).then(res => {
        if (res.canceled)
            return;
        const reason = String(res.formValues[0]) ?? "";
        const reasonText = reason ? `\n§r§l§c§¶Reason:§r§l§¶ ${reason}` : "";
        player.runCommandAsync(`scoreboard players reset "${selectedPlayer}" mac:muteList`);
        server_1.world.sendMessage(`§2MAC >§a ${selectedPlayer} has been unmuted${reasonText}`);
    });
}
exports.unmuteMenu = unmuteMenu;
function freezeMenu(player, selectedPlayer) {
    const form = new server_ui_1.ModalFormData()
        .title(`Freeze Player: ${selectedPlayer.name}`)
        .textField("§l§¶Reason", "§7§l§o§¶Type Here");
    form.show(player).then(res => {
        if (res.canceled)
            return;
        const reason = String(res.formValues[0]) ?? "";
        const reasonText = reason ? `\n§r§l§c§¶Reason:§r§l§¶ ${reason}` : "";
        player.runCommandAsync(`scoreboard players add "${selectedPlayer.name}" mac:frozenList 1`);
        server_1.world.sendMessage(`§2MAC >§c ${selectedPlayer.name} has been frozen${reasonText}`);
    });
}
exports.freezeMenu = freezeMenu;
function unfreezeMenu(player, selectedPlayer) {
    const form = new server_ui_1.ModalFormData()
        .title(`Unfreeze Player: ${selectedPlayer}`)
        .textField("§l§¶Reason", "§7§l§o§¶Type Here");
    form.show(player).then(res => {
        if (res.canceled)
            return;
        const reason = String(res.formValues[0]) ?? "";
        const reasonText = reason ? `\n§r§l§c§¶Reason:§r§l§¶ ${reason}` : "";
        player.runCommandAsync(`scoreboard players reset "${selectedPlayer}" mac:frozenList`);
        server_1.world.sendMessage(`§2MAC >§a ${selectedPlayer} has been unfrozen${reasonText}`);
    });
}
exports.unfreezeMenu = unfreezeMenu;
