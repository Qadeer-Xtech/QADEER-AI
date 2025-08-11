const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "googleimage",
    alias: ["searchimg", "img", "sort"],
    react: "🦋",
    desc: "Search and download Google images",
    category: "download",
    use: ".img <keywords>",
    filename: __filename
}, async (conn, m, message, { reply, args, from }) => {
    try {
        const query = args.join(' ');

        if (!query) {
            return reply("🖼️ Please provide a search query\nExample: .img cute cats");
        }

        await reply(`🔍 Searching images for "${query}"...`);

        const apiUrl = `https://apis.davidcyriltech.my.id/googleimage?query=${encodeURIComponent(query)}`;
        const response = await axios.get(apiUrl);

        if (!response.data?.success || !response.data?.results?.length) {
            return reply("❌ No images found. Try different keywords");
        }

        const results = response.data.results;
        const randomImages = results.sort(() => 0.5 - Math.random()).slice(0, 5);

        for (const imageUrl of randomImages) {
            await conn.sendMessage(from, {
                image: { url: imageUrl },
                caption: `📷 Result for: ${query}\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ǫᴀᴅᴇᴇʀ ᴋʜᴀɴ*`
            }, { quoted: m });
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

    } catch (error) {
        console.error("Image Search Error:", error);
        reply(`❌ Error: ${error.message || "Failed to fetch images"}`);
    }
});
