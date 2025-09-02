// sendinvite.js
const { cmd } = require('../command');

cmd({
    pattern: 'sendinvite',
    alias: ['send-invite'],
    desc: 'Invite a user to the group via link',
    category: 'group',
    use: '<phone number>',
    filename: __filename
}, async (client, message, m, { from, text, isGroup, isBotAdmins, isAdmins, reply }) => {
    try {
        if (!isGroup) {
            return reply('❌ This command can only be used *in a group chat*.');
        }
        if (!isAdmins) {
            return reply('❌ Only group admins can use this command.');
        }
        if (!isBotAdmins) {
            return reply('❌ I need to be *admin* in this group to generate invite links.');
        }
        if (!text) {
            return reply(
                `❌ *Please enter the number you want to invite.*\n\n` +
                `📌 *Example:*\n` +
                `*.sendinvite 923XXXXXXX*\n\n` +
                `💡 Use *.invite* to get the group link manually.`
            );
        }
        if (text.includes('+')) {
            return reply('⚠️ *Remove the "+" sign.* Just use digits.');
        }
        if (isNaN(text)) {
            return reply('⚠️ *Enter a valid number (digits only with country code)*.');
        }

        let inviteCode = await client.groupInviteCode(from);
        let inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
        let targetJid = `${text}@s.whatsapp.net`;

        await client.sendMessage(targetJid, {
            text: `📩 *GROUP INVITATION*\n\n` +
                  `👤 *Sender:* @${m.sender.split('@')[0]}\n` +
                  `💬 *Group ID:* ${from}\n\n` +
                  `🔗 ${inviteLink}`,
            mentions: [m.sender]
        });

        reply('✅ *Group invite link has been sent successfully!*');

    } catch (error) {
        console.error('Error in sendinvite command:', error);
        reply('⚠️ *An error occurred while sending the invite.*');
    }
});
