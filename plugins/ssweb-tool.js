// ssweb-tool.js
const axios = require('axios');
const { cmd } = require('../command');
const fetch = require('node-fetch');

cmd({
    pattern: 'ss',
    alias: ['ssweb'],
    react: '🚀',
    desc: 'Download screenshot of a given link or send direct image URL.',
    category: 'other',
    use: '.ss <link or image url>',
    filename: __filename
}, async (client, message, m, { from, reply, q }) => {
    
    if (!q) {
        return reply('Please provide a URL or image link.');
    }

    const isDirectImageUrl = /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(q);

    const sendScreenshot = async (buffer) => {
        return await client.sendMessage(from, {
            image: buffer,
            caption: `*📸 Screenshot Tool*\n\n🌐 *URL:* ${q}\n\n_*© 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽 🤖*_`,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363345872435489@newsletter',
                    newsletterName: '𝚀𝙰𝙳𝙴𝙴𝚁_𝙺𝙷𝙰𝙽',
                    serverMessageId: 143
                }
            }
        }, { quoted: m });
    };

    try {
        // Handle direct image URLs
        if (isDirectImageUrl) {
            const response = await fetch(q);
            if (!response.ok) throw new Error('Failed to fetch image from provided URL');
            const imageBuffer = await response.buffer();
            return await sendScreenshot(imageBuffer);
        }

        // Handle website URLs for screenshots
        if (!/^https?:\/\//.test(q)) {
            return reply('❗ Please provide a valid URL starting with http:// or https://');
        }

        const apiUrl = `https://delirius-apiofc.vercel.app/tools/ssweb?url=${encodeURIComponent(q)}`;
        const apiResponse = await axios.get(apiUrl);
        const screenshotData = apiResponse.data;

        if (!screenshotData.status || !screenshotData.data || !screenshotData.data.result) {
            throw new Error('Failed to get screenshot URL');
        }
        
        const screenshotUrl = screenshotData.data.result;
        const imageResponse = await fetch(screenshotUrl);
        const imageBuffer = await imageResponse.buffer();
        
        return await sendScreenshot(imageBuffer);

    } catch (error) {
        console.error(error);
        reply('❌ Failed to capture the screenshot. Please try again later.');
    }
});
