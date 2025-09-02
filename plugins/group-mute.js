// File: group-mute.js
const { cmd } = require('../command');

cmd({
    pattern: 'mute',
    alias: ['groupmute'],
    desc: 'Mute the group (Only admins can send messages).',
    category: 'group',
    filename: __filename
}, async (bot, msg, text, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    
    await bot.sendMessage(from, { react: { text: '🤫', key: msg.key } });

    try {
        if (!isGroup) {
            return reply('❌ This command can only be used in groups.');
        }
        if (!isAdmins) {
            return reply('❌ Only group admins can use this command.');
        }
        if (!isBotAdmins) {
            return reply('❌ I need to be an admin to mute the group.');
        }
        
        await bot.groupSettingUpdate(from, 'announcement');
        reply('✅ Group has been muted. Only admins can send messages.');

    } catch (error) {
        console.error('Error muting group:', error);
        reply('❌ Failed to mute the group. Please try again.');
    }
});
