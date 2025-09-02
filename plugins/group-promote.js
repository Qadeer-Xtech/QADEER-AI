// File: group-promote.js
const { cmd } = require('../command');

cmd({
    pattern: 'promote',
    alias: ['p', 'makeadmin'],
    desc: 'Promotes a member to group admin',
    category: 'admin',
    filename: __filename
}, async (bot, msg, text, { from, quoted, q, isGroup, botNumber, isBotAdmins, isAdmins, reply }) => {

    await bot.sendMessage(from, { react: { text: '⬆️', key: msg.key } });

    if (!isGroup) return reply('❌ This command can only be used in groups.');
    if (!isAdmins) return reply('❌ Only group admins can use this command.');
    if (!isBotAdmins) return reply('❌ I need to be an admin to use this command.');

    // Determine the target user to promote
    let targetUser = msg.mentionedJid?.[0] || msg.quoted?.sender || (q ? q.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

    if (!targetUser) {
        return reply('❌ Please tag, reply, or provide a number to promote.');
    }
    
    // Prevent the bot from promoting itself
    if (targetUser.split('@')[0] === botNumber.split('@')[0]) {
        return reply('❌ The bot cannot promote itself.');
    }

    try {
        await bot.groupParticipantsUpdate(from, [targetUser], 'promote');
        const successMessage = `✅ Successfully promoted @${targetUser.split('@')[0]} to admin.`;
        await bot.sendMessage(from, { text: successMessage, mentions: [targetUser] });

    } catch (error) {
        console.error('Promote command error:', error);
        let errorMessage = error?.data === 404
            ? '❌ Server error. This may be a LID user or WhatsApp limitation.'
            : '❌ Failed to promote the member.';
        reply(errorMessage);
    }
});
