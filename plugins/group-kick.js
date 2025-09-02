// File: group-kick.js
const { cmd } = require('../command');

cmd({
    pattern: 'kick',
    alias: ['remove', 'k', 'fling'],
    desc: 'Removes a member from the group',
    category: 'admin',
    react: '❌',
    use: ' <@user or reply>',
    filename: __filename
}, async (bot, msg, text, { from, q, isGroup, isBotAdmins, reply, quoted, isAdmins, senderNumber }) => {
    
    if (!isGroup) {
        return reply('❌ This command can only be used in groups.');
    }

    // This check restricts the command to the bot owner or group admins.
    const botId = bot.user.id.split(':')[0];
    const botLid = bot.user.lid ? bot.user.lid.split(':')[0] : null;
    if (senderNumber !== botId && senderNumber !== botLid && !isAdmins) {
        return reply('❌ Only group admins can use this command.');
    }
    
    if (!isBotAdmins) {
        return reply('❌ I need to be an admin to use this command.');
    }

    // Determine the target user to kick from mention, reply, or number
    let targetUser = msg.mentionedJid?.[0] || msg.quoted?.sender || (q ? q.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

    if (!targetUser) {
        return reply('❌ Please tag, reply, or provide a number to kick.');
    }

    try {
        await bot.groupParticipantsUpdate(from, [targetUser], 'remove');
        reply('✅ Successfully kicked the user from the group.');
    } catch (error) {
        reply('❌ Failed to kick user. The user might be an admin, or I may lack permissions.');
    }
});
