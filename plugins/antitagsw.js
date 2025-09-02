const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const warnings = require('../lib/warnings');
const config = require('../config');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions');

const antiTagSWPath = path.join(__dirname, '../lib/antitagsw.json');

// Create the JSON file if it doesn't exist
if (!fs.existsSync(antiTagSWPath)) {
    fs.writeFileSync(antiTagSWPath, '{}', 'utf-8');
}

// Function to load settings from the JSON file
const loadAntiTagSW = () => {
    try {
        const data = fs.readFileSync(antiTagSWPath, 'utf-8');
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('[AntiTagSW] Failed to load or parse antitagsw.json:', error);
        // If parsing fails, create a new empty file
        fs.writeFileSync(antiTagSWPath, '{}', 'utf-8');
        return {};
    }
};

// Function to save settings to the JSON file
const saveAntiTagSW = (data) => {
    try {
        fs.writeFileSync(antiTagSWPath, JSON.stringify(data, null, 4), 'utf-8');
    } catch (error) {
        console.error('[AntiTagSW] Failed to save antitagsw.json:', error);
    }
};

cmd({
    pattern: 'anti-tag',
    alias: ['antitag', 'antitagsw', 'antitagstatus', 'antistatustag'],
    desc: 'Enable/Disable Anti Status Tagging for this group',
    category: 'group',
    use: '.anti-tag on/off'
}, async (sock, m, store, { from, isGroup, senderNumber, isAdmins, isBotAdmins, reply, args }) => {

    if (!isGroup) {
        return reply('❌ This command can only be used in groups.');
    }
    if (!isAdmins) {
        return reply('❌ Only group admins can use this command.');
    }
    if (!isBotAdmins) {
        return reply('❌ I need to be an admin to perform this action.');
    }
    if (!args[0]) {
        return reply('⚠️ Usage: .anti-tag on / off');
    }

    const option = args[0].toLowerCase();
    let settings = loadAntiTagSW();

    if (option === 'on') {
        if (settings[from] === true) {
            return reply('✅ AntiTag is already enabled in this group.');
        }
        settings[from] = true;
        saveAntiTagSW(settings);
        return reply('✅ AntiTag has been ENABLED in this group!');
    } else if (option === 'off') {
        if (!settings[from]) {
            return reply('❌ AntiTag is already disabled in this group.');
        }
        settings[from] = false;
        saveAntiTagSW(settings);
        return reply('❌ AntiTag has been DISABLED in this group!');
    } else {
        return reply("⚠️ Please choose either 'on' or 'off'");
    }
});

module.exports = { loadAntiTagSW, saveAntiTagSW };
