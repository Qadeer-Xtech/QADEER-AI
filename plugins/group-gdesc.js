// File: group-gdesc.js
const config = require('../config');
const { cmd } = require('../command');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions');

cmd({
    pattern: 'gdesc',
    alias: ['upgdesc', 'updategdesc'],
    desc: 'Change the group description.',
    category: 'group',
    filename: __filename,
    use: '<new_description>'
}, async (bot, msg, text, { from, isGroup, isAdmins, isBotAdmins, q, reply }) => {

    // React to the command message
    await bot.sendMessage(msg.key.remoteJid, { react: { text: '🔄', key: msg.key } });

    try {
        // Check if the command is used in a group
        if (!isGroup) {
            return reply('❌ This command can only be used in groups.');
        }
        // Check if the user is a group admin
        if (!isAdmins) {
            return reply('❌ Only group admins can use this command.');
        }
        // Check if the bot is a group admin
        if (!isBotAdmins) {
            return reply('❌ I need to be an admin to update the group description.');
        }
        // Check if a new description is provided
        if (!q) {
            return reply('❌ Please provide a new group description.');
        }
        
        // Update the group description
        await bot.groupUpdateDescription(from, q);
        reply('✅ Group description has been updated.');

    } catch (error) {
        console.error('Error updating group description:', error);
        reply('❌ Failed to update the group description. Please try again.');
    }
});
