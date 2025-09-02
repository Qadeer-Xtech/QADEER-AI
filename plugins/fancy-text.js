// fancy-text.js

const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: 'fancy',
    alias: ['font', 'style'],
    desc: 'Convert text into various fonts.',
    category: 'tools',
    filename: __filename,
    use: '<text>'
}, async (sock, m, message, { from, q: text, reply }) => {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '✍️', key: m.key } });
    try {
        if (!text) {
            return reply('❎ Please provide text to convert into fancy fonts.\n\n*Example:* .fancy Hello');
        }

        const apiUrl = `https://www.dark-yasiya-api.site/other/font?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl);

        if (!response.data.status) {
            return reply('❌ Error fetching fonts. Please try again later.');
        }

        // Format the fonts into a readable list
        const fontList = response.data.result
            .map(font => `*${font.name}:*\n${font.result}`)
            .join('\n\n');

        const responseText = `✨ *Fancy Fonts Converter* ✨\n\n${fontList}\n\n> *𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽* 🤖`;

        await sock.sendMessage(from, { text: responseText }, { quoted: m });
    } catch (error) {
        console.error('Error in fancy command:', error);
        reply('⚠️ An error occurred while fetching fonts.');
    }
});
