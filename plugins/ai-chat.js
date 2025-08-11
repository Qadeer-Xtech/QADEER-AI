const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "ai",
    alias: ["bot", "crazy", "gpt", "gpt4", "bing"],
    desc: "Chat with an AI model.",
    category: "ai",
    react: "🤖",
    filename: __filename,
    // 'usage_reply' aur 'use' yahan se bhi hata diya gaya hai
},
async (conn, m, { q, from }) => { // Parameters ko 'vv2' jaisa saaf kar diya gaya hai
    try {
        const text = q?.trim();

        // FIX: 'reply' ki jagah 'conn.sendMessage' ka istemal
        if (!text) {
            return await conn.sendMessage(from, {
                text: "Please provide a message for the AI.\nExample: `.ai Hello`"
            }, { quoted: m });
        }
        
        const apiUrl = `https://api.vihangayt.me/api/ai/chatgpt?q=${encodeURIComponent(text)}`;
        const { data } = await axios.get(apiUrl);

        // FIX: 'reply' ki jagah 'conn.sendMessage' ka istemal
        if (!data || data.status !== true || !data.data) {
            return await conn.sendMessage(from, {
                text: "❌ AI failed to respond. The service might be down. Please try again later."
            }, { quoted: m });
        }
        
        // FIX: 'reply' ki jagah 'conn.sendMessage' ka istemal
        await conn.sendMessage(from, {
            text: `🤖 *AI Response:*\n\n${data.data}`
        }, { quoted: m });

    } catch (e) {
        console.error("Error in AI command:", e);
        // FIX: 'reply' ki jagah 'conn.sendMessage' ka istemal
        await conn.sendMessage(from, {
            text: "❌ An error occurred while communicating with the AI. Please check your console for details."
        }, { quoted: m });
    }
});
