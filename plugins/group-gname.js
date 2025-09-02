// File: group-gname.js
const { cmd } = require('../command');

cmd({
    pattern: 'gname',
    alias: ['upgname', 'updategname'],
    desc: 'Change the group name.',
    category: 'group',
    filename: __filename,
    use: '<new_name>'
}, async (bot, msg, text, { from, isGroup, isAdmins, isBotAdmins, q, reply }) => {
    
    await bot.sendMessage(from, { react: { text: '📝', key: msg.key } });

    try {
        if (!isGroup) return reply('❌ This command can only be used in groups.');
        if (!isAdmins) return reply('❌ Only group admins can use this command.');
        if (!isBotAdmins) return reply('❌ I need to be an admin to update the group name.');
        if (!q) return reply('❌ Please provide a new group name.');
        
        await bot.groupUpdateSubject(from, q);
        reply(`✅ Group name has been updated to: *${q}*`);

    } catch (error) {
        console.error('Error updating group name:', error);
        reply('❌ Failed to update the group name. Please try again.');
    }
});
