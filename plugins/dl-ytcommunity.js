// dl-ytcommunity.js

const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: 'ytpost',
    alias: ['ytcommunity', 'ytc'],
    desc: 'Download a YouTube community post',
    category: 'downloader',
    filename: __filename,
    use: '<YouTube community post URL>'
}, async (sock, m, message, { from, args, q: url, reply, react }) => {
    try {
        // Send a thinking emoji reaction
        await sock.sendMessage(message.key.remoteJid, { react: { text: '🎥', key: message.key } });

        if (!url) {
            return reply('Please provide a YouTube community post URL.\nExample: `.ytpost <url>`');
        }

        // Fetch data from the external API
        const apiUrl = `https://api.siputzx.my.id/api/d/ytpost?url=${encodeURIComponent(url)}`;
        const { data: apiResponse } = await axios.get(apiUrl);

        if (!apiResponse.status || !apiResponse.data) {
            await react('❌');
            return reply('Failed to fetch the community post. Please check the URL.');
        }

        const postData = apiResponse.data;
        let caption = `📢 *YouTube Community Post* 📢\n\n📜 *Content:* ${postData.content}`;

        // Check if there are images to send
        if (postData.images && postData.images.length > 0) {
            for (const imageUrl of postData.images) {
                // Send each image with the caption
                await sock.sendMessage(from, {
                    image: { url: imageUrl },
                    caption: caption
                }, { quoted: m });
                // Clear the caption after the first image so it's not repeated
                caption = '';
            }
        } else {
            // If no images, just send the text content
            await sock.sendMessage(from, { text: caption }, { quoted: m });
        }

        await react('✅');

    } catch (error) {
        console.error("Error in ytpost command:", error);
        await react('❌');
        reply('An error occurred while fetching the YouTube community post.');
    }
});
