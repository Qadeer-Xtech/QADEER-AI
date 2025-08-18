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
        const query = args.length ? args.join(' ') : null;

        if (!query) {
            return reply('❌ Please provide a question!\n\nExample: .ai What is artificial intelligence?');
        }

        const apis = [
            `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(query)}`,
            `https://vapis.my.id/api/openai?q=${encodeURIComponent(query)}`
        ];

        let response = null;

        for (const url of apis) {
            try {
                const res = await axios.get(url, { timeout: 15000 });
                if (res.data?.message) {
                    response = res.data.message;
                    break;
                }
            } catch (err) {
                console.error(`❌ API failed: ${url}`, err.message);
            }
        }

        if (!response) {
            response = '⚠️ Sorry, all AI servers are currently down. Try again later!';
        }

        await reply(`🤖 *AI Response:*\n\n${response}`);

    } catch (error) {
        console.error('❌ AI Plugin Error:', error.message);
        await reply('⚠️ Failed to fetch AI response. Please check logs.');
    }
});