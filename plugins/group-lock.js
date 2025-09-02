// File: group-lock.js
const { cmd } = require('../command');

cmd({
    pattern: 'lockgc',
    alias: ['lock'],
    desc: 'Lock the group (Prevents new members from joining).',
    category: 'group',
    filename: __filename
}, async (bot, msg, text, { from, isGroup, isAdmins, isBotAdmins, reply }) => {

    await bot.sendMessage(from, { react: { text: '🔒', key: msg.key } });

    try {
        if (!isGroup) return reply('❌ This command can only be used in groups.');
        if (!isAdmins) return reply('❌ Only group admins can use this command.');
        if (!isBotAdmins) return reply('❌ I need to be an admin to lock the group.');
        
        await bot.groupSettingUpdate(from, 'locked');
        reply('✅ Group has been locked. New members cannot join via invite link.');

    } catch (error) {
        console.error('Error locking group:', error);
        reply('❌ Failed to lock the group. Please try again.');
    }
});
