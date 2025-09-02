// File: group-link.js
const { cmd } = require('../command');

cmd({
    pattern: 'grouplink',
    alias: ['glink', 'invite'],
    desc: 'Get group invite link.',
    category: 'group',
    filename: __filename
}, async (bot, msg, text, { from, isGroup, senderNumber, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) {
            return reply('This feature is only for groups!');
        }

        // Owner/Admin check
        const botId = bot.user.id.split(':')[0];
        const botLid = bot.user.lid ? bot.user.lid.split(':')[0] : null;
        if (senderNumber !== botId && senderNumber !== botLid && !isAdmins) {
            return reply('❌ Only group admins can use this command.');
        }
        
        if (!isBotAdmins) {
            return reply('Please make me an admin first!');
        }
        
        const inviteCode = await bot.groupInviteCode(from);
        if (!inviteCode) {
            return reply('Failed to retrieve the invite code.');
        }

        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
        const response = `*Here is your group invite link:*\n${inviteLink}\n\nUse .sendinvite to send the group link to a user's DM.`;
        
        return reply(response);

    } catch (error) {
        console.error('Error in invite command:', error);
        reply('An error occurred: ' + (error.message || 'Unknown error'));
    }
});
