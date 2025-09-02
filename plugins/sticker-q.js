// sticker-q.js
const axios = require('axios');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { getBuffer } = require('../lib/functions');
const config = require('../config');
const { cmd } = require('../command');

cmd({
    pattern: 'quoted',
    desc: 'Makes a sticker from quoted text or inline text.',
    alias: ['q', 'qc'],
    category: 'tools',
    use: '<reply to any message or write text>',
    filename: __filename
}, async (client, message, m, { from, isPatron, q, quoted, reply }) => {
    try {
        if (!isPatron) {
            return reply('*❌ Only the bot owner can use this command.*');
        }

        const textToQuote = m.quoted?.text || m.message?.body || q;
        if (!textToQuote) {
            return reply('_❌ Provide or reply to a message with text._');
        }

        const senderJid = m.message?.sender || m.sender;
        const profilePicUrl = await client.profilePictureUrl(senderJid, 'image').catch(() => 'https://files.catbox.moe/wpi099.png');
        const senderName = m.pushName || await client.getName(senderJid);

        const payload = {
            "type": "quote",
            "format": "png",
            "backgroundColor": "#FFFFFF",
            "width": 512,
            "height": 512,
            "scale": 3,
            "messages": [{
                "avatar": true,
                "from": {
                    "first_name": senderName,
                    "language_code": "en",
                    "name": senderName,
                    "photo": {
                        "url": profilePicUrl
                    }
                },
                "text": textToQuote,
                "replyMessage": {}
            }]
        };

        const apiResponse = await axios.post('https://bot.lyo.su/quote/generate', payload);
        const imageBuffer = await getBuffer(`data:image/png;base64,${apiResponse.data.result.image}`);

        const sticker = new Sticker(imageBuffer, {
            pack: config.STICKER_NAME || '𝚀𝙰𝙳𝙴𝙴𝚁_𝙺𝙷𝙰𝙽 🤖',
            author: senderName,
            type: StickerTypes.FULL,
            quality: 75
        });

        const stickerBuffer = await sticker.toBuffer();
        await client.sendMessage(from, { sticker: stickerBuffer }, { quoted: message });

    } catch (error) {
        console.error("Quotely error:", error);
        return reply(`❌ *Quotely Error:* ${error.message}`);
    }
});
