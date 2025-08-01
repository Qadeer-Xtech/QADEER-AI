const config = require('../config');
const { cmd } = require('../command');


cmd({ 
    pattern: "playx", 
    alias: ["play2", "song2"], 
    react: "🎵", 
    desc: "Download YouTube song (simple)", 
    category: "main", 
    use: '.playx <song name>', 
    filename: __filename 
}, async (conn, mek, m, { from, sender, reply, q }) => { 
    try {
        if (!q) return reply("Please provide a song name to search.");

        const searchUrl = `https://apis.davidcyriltech.my.id/play?query=${encodeURIComponent(q)}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (!searchData.status || !searchData.result) {
            return reply("No results found or API error occurred.");
        }

        const song = searchData.result;
        
        await conn.sendMessage(from, {
            audio: { url: song.download_url },
            mimetype: "audio/mpeg",
            fileName: `${song.title}.mp3`
        }, { quoted: mek });

        await reply(`🎵 *${song.title}*\n⏳ ${song.duration}`);

    } catch (error) {
        console.error(error);
        reply("An error occurred. Please try again.");
    }
});
