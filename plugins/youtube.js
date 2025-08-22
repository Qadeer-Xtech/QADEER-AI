const config = require('../config');
const { cmd } = require('../command');
const ytdl = require('ytdl-core');
const yts = require("yt-search");
const { WAMediaUpload, WAProto } = require("@whiskeysockets/baileys"); // Yeh line add karna zaroori hai

// Function to format seconds into HH:MM:SS
function formatDuration(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

//================================================================================
// AUDIO DOWNLOADER COMMAND
//================================================================================
cmd({
    pattern: "new-song",
    react: "🎵",
    desc: "Downloads audio from YouTube.",
    category: "download",
    use: ".new-song <song name or youtube url>",
    filename: __filename
},
async (conn, m, mek, { q, reply }) => {
    if (!q) return reply("Please provide a song name or a YouTube URL.");

    try {
        await conn.sendMessage(m.from, { react: { text: "📥", key: m.key } });
        let video;
        if (ytdl.validateURL(q)) {
            const videoId = ytdl.getURLVideoID(q);
            const search = await yts({ videoId });
            video = search;
        } else {
            const search = await yts(q);
            video = search.videos[0];
        }

        if (!video) return reply("❌ Song not found. Please try a different name.");

        const captionText = `🎧 *Now Downloading Your Song* 🎧\n\n` +
                            `*✨ Title:* ${video.title}\n` +
                            `*⏳ Duration:* ${video.timestamp}\n` +
                            `*👤 Author:* ${video.author.name}\n\n` +
                            `> *© ${config.BOT_NAME}*`;

        await conn.sendMessage(m.from, {
            image: { url: video.thumbnail },
            caption: captionText
        }, { quoted: mek });
        
        const audioStream = ytdl(video.url, {
            filter: 'audioonly',
            quality: 'highestaudio'
        });
        
        // FIX: Naye Baileys ke version ke mutabiq code
        await conn.sendMessage(m.from, {
             audio: audioStream,
             mimetype: 'audio/mpeg',
             fileName: `${video.title}.mp3`,
             ptt: false
        }, { quoted: mek });

        await conn.sendMessage(m.from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("Error in new-song command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});

//================================================================================
// VIDEO DOWNLOADER COMMAND
//================================================================================
cmd({
    pattern: "new-mp4",
    react: "🎥",
    desc: "Downloads video from YouTube.",
    category: "download",
    use: ".new-mp4 <video name or youtube url>",
    filename: __filename
},
async (conn, m, mek, { q, reply }) => {
    if (!q) return reply("Please provide a video name or a YouTube URL.");

    try {
        await conn.sendMessage(m.from, { react: { text: "📥", key: m.key } });
        let video;
        if (ytdl.validateURL(q)) {
            const videoId = ytdl.getURLVideoID(q);
            const search = await yts({ videoId });
            video = search;
        } else {
            const search = await yts(q);
            video = search.videos[0];
        }

        if (!video) return reply("❌ Video not found. Please try a different name.");

        const captionText = `🎬 *Now Downloading Your Video* 🎬\n\n` +
                            `*✨ Title:* ${video.title}\n` +
                            `*⏳ Duration:* ${video.timestamp}\n` +
                            `*👤 Author:* ${video.author.name}\n\n` +
                            `> *© ${config.BOT_NAME}*`;
                            
        await conn.sendMessage(m.from, {
            image: { url: video.thumbnail },
            caption: captionText
        }, { quoted: mek });

        const videoStream = ytdl(video.url, {
            filter: 'audioandvideo',
            quality: 'highestvideo'
        });
        
        // FIX: Naye Baileys ke version ke mutabiq code
        await conn.sendMessage(m.from, {
            video: videoStream,
            mimetype: 'video/mp4',
            caption: `*${video.title}*`
        }, { quoted: mek });

        await conn.sendMessage(m.from, { react: { text: "✅", key: m.key } });

    } catch (e) {
        console.error("Error in new-mp4 command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
