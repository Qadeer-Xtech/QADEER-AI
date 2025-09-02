// File: group-unlock.js
const { cmd } = require('../command');

cmd({
    pattern: 'unlockgc',
    alias: ['unlock'],
    desc: 'Unlock the group (Allows new members to join).',
    category: 'group',
    filename: __filename
}, async (bot, msg, text, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    
    await bot.sendMessage(from, { react: { text: '🔓', key: msg.key } });

    try {
        if (!isGroup) {
            return reply('❌ This command can only be used in groups.');
        }
        if (!isAdmins) {
            return reply('❌ Only group admins can use this command.');
        }
        if (!isBotAdmins) {
            return reply('❌ I need to be an admin to unlock the group.');
        }

        await bot.groupSettingUpdate(from, 'unlocked');
        reply('✅ Group has been unlocked. New members can now join.');

    } catch (error) {
        console.error('Error unlocking group:', error);
        reply('❌ Failed to unlock the group. Please try again.');
    }
});
