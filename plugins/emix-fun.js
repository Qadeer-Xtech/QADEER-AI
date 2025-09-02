// emix-fun.js

const { cmd } = require('../command');
const { fetchEmix } = require('../lib/emix-utils');
const { getBuffer } = require('../lib/functions');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

cmd({
    pattern: 'emix',
    desc: 'Combine two emojis into a sticker.',
    category: 'fun',
    use: '😂,🙂',
    filename: __filename
}, async (sock, m, message, { args, q: query, reply }) => {
    try {
        // Send a thinking emoji reaction
        await sock.sendMessage(message.key.remoteJid, { react: { text: '😃', key: message.key } });

        if (!query.includes(',')) {
            return reply('❌ *Usage:* .emix 😂,🙂\n_Send two emojis separated by a comma._');
        }

        let [emoji1, emoji2] = query.split(',').map(e => e.trim());

        if (!emoji1 || !emoji2) {
            return reply('❌ Please provide two emojis separated by a comma.');
        }

        // Fetch the mixed emoji image URL
        let imageUrl = await fetchEmix(emoji1, emoji2);
        if (!imageUrl) {
            return reply('❌ Could not generate emoji mix. Try different emojis.');
        }
        
        // Download the image
        let imageBuffer = await getBuffer(imageUrl);
        
        // Create a sticker from the image buffer
        let sticker = new Sticker(imageBuffer, {
            pack: 'Emoji Mix',
            author: 'PATRON-MD',
            type: StickerTypes.FULL,
            categories: ['🤩', '🎉'],
            quality: 75,
            background: 'transparent'
        });

        const stickerBuffer = await sticker.toBuffer();
        
        // Send the final sticker
        await sock.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });

    } catch (error) {
        console.error("Error in .emix command:", error.message);
        reply(`❌ Could not generate emoji mix: ${error.message}`);
    }
});
