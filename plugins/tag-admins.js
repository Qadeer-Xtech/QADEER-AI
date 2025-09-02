// tag-admins.js
const { cmd } = require('../command');
const { getGroupAdmins } = require('../lib/functions');

cmd({
    pattern: 'tagadmin',
    alias: ['tagadmins'],
    desc: 'To Tag all Admins of the Group',
    category: 'group',
    use: '.tagadmins [message]',
    filename: __filename
}, async (client, message, m, { from, participants, reply, isGroup, senderNumber, groupAdmins, command, body, isPatron }) => {
    
    await client.sendMessage(m.key.remoteJid, { react: { text: '👑', key: m.key } });

    try {
        if (!isGroup) {
            return reply('❌ This command can only be used *in a group chat*.');
        }
        if (!isPatron) {
            return reply('❌ Only *bot owners* can use this command.');
        }

        let groupMetadata = await client.groupMetadata(from).catch(() => null);
        if (!groupMetadata) {
            return reply('❌ Failed to fetch group information.');
        }

        let groupName = groupMetadata.subject || 'Unknown Group';
        let admins = await getGroupAdmins(participants);
        let adminCount = admins ? admins.length : 0;

        if (adminCount === 0) {
            return reply('❌ No admins found in this group.');
        }
        
        const emojiList = ['👑', '⚡', '🌟', '✨', '🎖️', '💎', '🔱', '🛡️', '🚀', '🏆'];
        const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
        
        let customMessage = body.slice(body.indexOf(command) + command.length).trim();
        if (!customMessage) {
            customMessage = 'Attention Admins';
        }

        let tagMessage = `▢ Group : *${groupName}*\n` +
                         `▢ Admins : *${adminCount}*\n` +
                         `▢ Message: *${customMessage}*\n\n` +
                         `┌───⊷ *ADMIN MENTIONS*\n`;

        for (let admin of admins) {
            if (!admin) continue;
            tagMessage += `${randomEmoji} @${admin.split('@')[0]}\n`;
        }
        
        tagMessage += `└──✪ QADEER ┃ AI ✪──`;
        
        client.sendMessage(from, {
            text: tagMessage,
            mentions: admins
        }, { quoted: message });

    } catch (error) {
        console.error("TagAdmins Error:", error);
        reply(`❌ *Error Occurred !!*\n\n${error.message || error}`);
    }
});
