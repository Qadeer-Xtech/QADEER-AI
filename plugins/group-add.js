// File: group-add.js
const { cmd } = require('../command');

cmd({
    pattern: 'add',
    alias: ['a'],
    desc: 'Adds a member to the group',
    category: 'group',
    filename: __filename,
    use: '<countrycode+number>'
}, async (bot, msg, text, { from, q, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) return reply('❌ This command can only be used in groups.');
        if (!isAdmins) return reply('❌ Only group admins can use this command.');
        if (!isBotAdmins) return reply('❌ I need to be an admin to use this command.');
        if (!q) return reply('❌ Please provide a number with country code\nExample: .add 923001234567');

        const number = q.replace(/[^0-9]/g, '');
        if (number.length < 10) return reply('❌ Invalid number. Please use format: countrycode + number\nExample: .add 923001234567');
        if (number.startsWith('0')) return reply('❌ Don\'t use 0 at start. Use country code instead\nExample: .add 923001234567');

        const userJid = number + '@s.whatsapp.net';
        const response = await bot.groupParticipantsUpdate(from, [userJid], 'add');
        
        if (!response || !response[0]) return reply('❌ Failed to add user');

        switch (response[0].status) {
            case '200':
                return bot.sendMessage(from, { 
                    text: `✅ Successfully added @${userJid.split('@')[0]}`,
                    mentions: [userJid]
                });
            case '403': // User has privacy settings preventing adds
            case '408': // Same as 403
                try {
                    const inviteCode = await bot.groupInviteCode(from);
                    const groupLink = 'https://chat.whatsapp.com/' + inviteCode;
                    await bot.sendMessage(userJid, { text: `Hello! You were invited to join our group but your privacy settings prevent direct adds.\n\nHere's the group invite link:\n${groupLink}` });
                    return bot.sendMessage(from, {
                        text: `📨 User has restricted adds. Sent the group link to @${userJid.split('@')[0]} in DM.`,
                        mentions: [userJid]
                    });
                } catch (e) {
                    return reply('❌ User has restricted adds. Failed to send group link.');
                }
            case '409': // User is already in the group
                return reply('❌ The user is already in the group');
            case '500': // Group is full
                return reply('❌ Group is full or reached participant limit');
            default:
                return reply('❌ Failed to add user. Make sure the number is correct.');
        }

    } catch (error) {
        return reply('❌ Failed to add member. Check the number format.');
    }
});
