// File: group-dismiss.js
const { cmd } = require('../command');

cmd({
    pattern: 'demote',
    alias: ['d', 'dismiss', 'removeadmin'],
    desc: 'Demotes a group admin to a normal member',
    category: 'admin',
    filename: __filename,
    use: '<@user or number>'
}, async (bot, msg, text, { from, q, isGroup, botNumber, isBotAdmins, isAdmins, reply }) => {

    await bot.sendMessage(msg.key.remoteJid, { react: { text: '⬇️', key: msg.key } });

    if (!isGroup) return reply('❌ This command can only be used in groups.');
    if (!isAdmins) return reply('❌ Only group admins can use this command.');
    if (!isBotAdmins) return reply('❌ I need to be an admin to use this command.');
    
    // Determine the target user to demote by mention, reply, or number
    let targetUser = msg.mentionedJid?.[0] || msg.quoted?.sender || (q ? q.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

    if (!targetUser) {
        return reply('❌ Please tag, reply, or provide a number to demote.');
    }

    // Prevent the bot from demoting itself
    if (targetUser.split('@')[0] === botNumber.split('@')[0]) {
        return reply('❌ The bot cannot demote itself.');
    }

    try {
        await bot.groupParticipantsUpdate(from, [targetUser], 'demote');
        const successMessage = `✅ Successfully demoted @${targetUser.split('@')[0]} to a normal member.`;
        await bot.sendMessage(from, { text: successMessage, mentions: [targetUser] });

    } catch (error) {
        console.error('Demote command error:', error);
        // Provide a more specific error for common issues
        let errorMessage = error?.data === 404 
            ? '❌ Server error. This may be a LID user or WhatsApp limitation.'
            : '❌ Failed to demote the member.';
        reply(errorMessage);
    }
});
