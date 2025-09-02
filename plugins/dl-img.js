// dl-img.js

const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: 'img',
    alias: ['image', 'searchimg', 'googleimage'],
    desc: 'Search and download Google images',
    category: 'fun',
    use: '<keywords>',
    filename: __filename
}, async (sock, m, message, { reply, args, from }) => {
    try {
        // Send a thinking emoji reaction
        await sock.sendMessage(message.key.remoteJid, { react: { text: '🦋', key: message.key } });

        const query = args.join(' ');
        if (!query) {
            return reply('🖼️ Please provide a search query\nExample: .img cute cats');
        }

        await reply(`🔍 Searching images for "${query}"...`);

        const apiUrl = `https://apis.davidcyriltech.my.id/googleimage?query=${encodeURIComponent(query)}`;
        const response = await axios.get(apiUrl);

        // Check for valid API response
        if (!response.data?.success || !response.data?.results?.length) {
            return reply('❌ No images found. Try different keywords');
        }

        const imageResults = response.data.results;
        
        // Shuffle the results and take the first 5
        const randomImages = imageResults.sort(() => 0.5 - Math.random()).slice(0, 5);

        // Send each image with a caption
        for (const imageUrl of randomImages) {
            await sock.sendMessage(from, {
                image: { url: imageUrl },
                caption: `📷 Result for: ${query}\n> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴTᴇᴄʜＸ* 🚹`
            }, { quoted: m });
            // Wait for a short duration between sending images
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

    } catch (error) {
        console.error("Image Search Error:", error);
        reply(`❌ Error: ${error.message || 'Failed to fetch images'}`);
    }
});
