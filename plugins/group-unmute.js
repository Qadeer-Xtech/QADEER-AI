// File: group-unmute.js
const { cmd } = require('../command');

cmd({
    pattern: 'unmute',
    alias: ['groupunmute'],
    desc: 'Unmute the group (Everyone can send messages).',
    category: 'group',
    filename: __filename
}, async (bot, msg, text, { from, isGroup, isAdmins, isBotAdmins, reply }) => {

    await bot.sendMessage(msg.key.remoteJid, { react: { text: '🔊', key: msg.key } });

    try {
        if (!isGroup) {
            return reply('❌ This command can only be used in groups.');
        }
        if (!isAdmins) {
            return reply('❌ Only group admins can use this command.');
        }
        if (!isBotAdmins) {
            return reply('❌ I need to be an admin to unmute the group.');
        }

        // Sets group setting to allow messages from all members
        await bot.groupSettingUpdate(from, 'not_announcement');
        reply('✅ Group has been unmuted. Everyone can send messages.');

    } catch (error) {
        console.error('Error unmuting group:', error);
        reply('❌ Failed to unmute the group. Please try again.');
    }
});
