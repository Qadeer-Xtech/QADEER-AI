const { cmd } = require('../command');

// Command 1: .ping
cmd({
    pattern: 'ping',
    alias: ['pong', 'speed'],
    use: '.ping',
    desc: 'Check bot\'s response time.',
    category: 'main',
    filename: __filename
}, async (bot, message, context, { from, sender, reply }) => {
    try {
        const startTime = new Date().getTime();
        
        const reactionEmojis = ['🔥', '⚡', '🚀', '💨', '🎯', '🎉', '🌟', '💥', '🕐', '🔹'];
        const iconEmojis = ['💎', '🏆', '⚡️', '🚀', '🎶', '🌠', '🌀', '🔱', '🛡️', '✨'];
        
        const randomReaction = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
        await bot.sendMessage(from, { react: { text: randomReaction, key: message.key } });

        const endTime = new Date().getTime();
        const responseTime = ((endTime - startTime) / 1000).toFixed(2);
        
        const randomIcon = iconEmojis[Math.floor(Math.random() * iconEmojis.length)];
        const replyText = `> *QADEER-AI SPEED:* ${responseTime}s ${randomIcon}*`;

        await bot.sendMessage(from, {
            text: replyText,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 2,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363345872435489@newsletter',
                    newsletterName: '𝚀𝙰𝙳𝙴𝙴𝚁_𝙺𝙷𝙰𝙽',
                    serverMessageId: 143
                }
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in ping command:', error);
        reply('❌ Error: ' + error.message);
    }
});

// Command 2: .ping2
cmd({
    pattern: 'ping2',
    desc: 'Check bot\'s response time.',
    category: 'main',
    filename: __filename
}, async (bot, message, context, { from, reply }) => {
    try {
        await bot.sendMessage(from, { react: { text: '🍂', key: context.key } });
        
        const startTime = Date.now();
        const pingMsg = await bot.sendMessage(from, { text: '*PINGING...*' });
        const endTime = Date.now();
        
        const responseTime = endTime - startTime;

        await bot.sendMessage(from, { delete: pingMsg.key });
        
        const replyText = `> *🔥 QADEER-AI SPEED : ${responseTime}ms*`;
        await bot.sendMessage(from, { text: replyText }, { quoted: message });

    } catch (error) {
        console.error('Error in ping2 command:', error);
        reply('An error occurred: ' + error.message);
    }
});
