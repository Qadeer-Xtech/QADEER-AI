const axios = require("axios");
const { cmd } = require("../command");

cmd({
    pattern: "ringtone",
    alias: ["ringtones", "ring"],
    desc: "Get a random ringtone from the API.",
    react: "🎵",
    category: "download",
    filename: __filename,
},
async (conn, m, { q, from }) => {
    try {
        const query = q;
        if (!query) {
            const replyText = "Please provide a search query!\n\n*Example:* .ringtone Islamic";
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }

        const { data } = await axios.get(`https://www.dark-yasiya-api.site/download/ringtone?text=${encodeURIComponent(query)}`);

        if (!data.status || !data.result || data.result.length === 0) {
            const replyText = "No ringtones found for your query. Please try a different keyword.";
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }

        const randomRingtone = data.result[Math.floor(Math.random() * data.result.length)];

        await conn.sendMessage(
            from,
            {
                audio: { url: randomRingtone.dl_link },
                mimetype: "audio/mpeg",
                fileName: `${randomRingtone.title}.mp3`,
            },
            { quoted: m }
        );

    } catch (error) {
        console.error("Error in ringtone command:", error);
        const errorText = "Sorry, something went wrong while fetching the ringtone. Please try again later.";
        await conn.sendMessage(from, { text: errorText }, { quoted: m });
    }
});
