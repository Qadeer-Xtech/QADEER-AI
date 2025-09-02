// fun-ship.js

const axios = require('axios');
const fetch = require('node-fetch');
const { sleep } = require('../lib/functions');
const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: 'ship',
    alias: ['match', 'love'],
    desc: 'Randomly pairs the command user with another group member.',
    category: 'fun',
    filename: __filename
}, async (sock, m, message, { from, isGroup, groupMetadata, reply, sender }) => {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '❤️', key: m.key } });
    try {
        if (!isGroup) {
            return reply('❌ This command can only be used in groups.');
        }

        // Get the bot owner's JID if available
        const botOwner = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;
        const participants = groupMetadata.participants.map(p => p.id);
        
        let partner;

        // If the owner is in the group and is not the one using the command, pair with the owner
        if (botOwner && participants.includes(botOwner) && sender !== botOwner) {
            partner = botOwner;
        } else {
            // Otherwise, find a random partner who is not the sender
            do {
                partner = participants[Math.floor(Math.random() * participants.length)];
            } while (partner === sender);
        }

        const responseText = `💘 *Match Found!* 💘\n❤️ @${sender.split('@')[0]} + @${partner.split('@')[0]}\n💖 Congratulations! 🎉`;

        await sock.sendMessage(from, {
            text: responseText,
            contextInfo: {
                mentionedJid: [sender, partner],
                forwardingScore: 2,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363345872435489@newsletter',
                    newsletterName: '𝚀𝙰𝙳𝙴𝙴𝚁_𝙺𝙷𝙰𝙽',
                    serverMessageId: 143
                }
            }
        });

    } catch (error) {
        console.error('Error in ship command:', error);
        reply('⚠️ An error occurred while processing the command. Please try again.');
    }
});
