// File: group-tagall.js
const { cmd } = require('../command');

cmd({
    pattern: 'tagall',
    alias: ['gc_tagall'],
    desc: 'To Tag all Members',
    category: 'group',
    use: '[message]',
    filename: __filename
}, async (bot, msg, text, { from, participants, reply, isGroup, isPatron, body, command }) => {

    await bot.sendMessage(from, { react: { text: '🔊', key: msg.key } });

    try {
        if (!isGroup) {
            return reply('❌ This command can only be used in groups.');
        }
        // This appears to be a check for a premium/authorized user
        if (!isPatron) {
            return reply('*📛 This command is restricted to owners only.*');
        }

        const groupMeta = await bot.groupMetadata(from).catch(() => null);
        if (!groupMeta) {
            return reply('❌ Failed to fetch group information.');
        }

        const memberCount = participants ? participants.length : 0;
        if (memberCount === 0) {
            return reply('❌ No members found in this group.');
        }
        
        const groupName = groupMeta.subject || 'Unknown Group';
        
        // Extract the message text after the command
        let messageText = body.slice(body.indexOf(command) + command.length).trim();
        if (!messageText) {
            messageText = 'Attention Everyone';
        }

        // Construct the message with mentions
        let message = `▢ Group : *${groupName}*` +
                      `\n▢ Members : *${memberCount}*` +
                      `\n▢ Message: *${messageText}*` +
                      `\n\n┌───⊷ *MENTIONS*\n`;

        const mentionEmojis = ['📢', '🔊', '🌐', '🔰', '🛡️', '🤍', '🚹', '📝', '💗', '🔖', '🪩', '📦', '🎉', '🗣️', '💸', '⏳', '🗿', '🚀', '🎧', '🪀', '⚡', '🚩', '🍁', '❤‍🩹', '👻', '⚠️', '🔥'];
        const randomEmoji = mentionEmojis[Math.floor(Math.random() * mentionEmojis.length)];

        for (let member of participants) {
            if (!member.id) continue;
            message += `${randomEmoji} @${member.id.split('@')[0]}\n`;
        }
        message += '└──✪ QADEER ┃ AI ✪──';

        bot.sendMessage(from, {
            text: message,
            mentions: participants.map(p => p.id)
        }, { quoted: msg });

    } catch (error) {
        console.error('TagAll Error:', error);
        reply('❌ *An Error Occurred !!*\n\n' + (error.message || error));
    }
});
