// get-image.js
const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: 'getimage',
    alias: ['tophoto', 'urltoimage', 'fetchimage', 'url2image', 'imagefromurl'],
    desc: 'Convert image URL to WhatsApp image',
    category: 'media',
    filename: __filename
}, async (sock, message, { from, reply, text }) => {

    await sock.sendMessage(from, { react: { text: '🖼️', key: message.key } });

    try {
        if (!text) {
            return reply('Please provide an image URL\nExample: !getimage https://example.com/image.jpg');
        }

        const imageUrl = text.trim();
        
        if (!imageUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
            return reply('❌ Invalid image URL! Must be direct link to image (jpg/png/gif/webp)');
        }

        try {
            const response = await axios.head(imageUrl);
            if (!response.headers['content-type']?.startsWith('image/')) {
                return reply('❌ URL does not point to a valid image');
            }
        } catch (e) {
            return reply('❌ Could not access image URL. Please check the link');
        }

        await sock.sendMessage(from, {
            image: { url: imageUrl },
            caption: 'Here is your image from the URL PATRON-MD'
        }, { quoted: message });

    } catch (error) {
        console.error('GetImage Error:', error);
        reply(`❌ Failed to process image. Error: ${error.message}`);
    }
});
