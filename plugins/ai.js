const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "ai",
    alias: ["gpt", "chatgpt"],
    desc: "Ask AI (ChatGPT powered response).",
    category: "ai",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {
    try {
        const query = args.join(' ').trim();

        if (!query) {
            return reply('❌ Please provide a question!\n\n*Example:*\n.ai What is artificial intelligence?');
        }

        const apis = [
            `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(query)}`,
            `https://vapis.my.id/api/openai?q=${encodeURIComponent(query)}`,
        ];

        let responseText = null;

        for (const url of apis) {
            try {
                const config = {
                    timeout: 20000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    }
                };
                
                const res = await axios.get(url, config);
                const data = res.data;
                const message = data.message || data.result || data.data;

                if (message && typeof message === 'string') {
                    responseText = message.trim();
                    // console.log(`✅ API succeeded: ${url}`); // Hata diya gaya hai
                    break;
                } else {
                    // console.warn(`⚠️ API gave an unexpected response format: ${url}`, data); // Hata diya gaya hai
                }

            } catch (err) {
                // console.error(`❌ API failed: ${url}`, err.message); // Hata diya gaya hai
            }
        }

        if (responseText) {
            await reply(`🤖 *AI Response:*\n\n${responseText}`);
        } else {
            await reply('⚠️ Sorry, all AI servers seem to be busy or down right now. Please try again in a few moments!');
        }

    } catch (error) {
        // console.error('❌ Main AI Plugin Error:', error); // Hata diya gaya hai
        await reply('⚠️ An unexpected error occurred in the AI command.');
    }
});
