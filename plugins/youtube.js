const config = require('../config');
const { cmd } = require('../command');
const ytdl = require('@dark-yasiya/yt-dl.js');
const yts = require("yt-search");
const fs = require('fs');

// Function to format seconds into HH:MM:SS
function formatDuration(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
}


//================================================================================
// AUDIO DOWNLOADER COMMAND
//================================================================================
cmd({
    pattern: "new-song", // Command updated
    react: "🎵",
    desc: "Downloads audio from YouTube.",
    category: "download",
    use: ".new-song <song name or youtube url>", // Usage updated
    filename: __filename
},
async (conn, m, mek, { q, reply }) => {
    if (!q) return reply("Please provide a song name or a YouTube URL.");

    try {
        // Search for the video
        const search = await yts(q);
        const video = search.videos[0];
        if (!video) return reply("❌ Song not found. Please try a different name.");

        const url = video.url;
        const info = await ytdl.getInfo(url);

        // Check if audio format is available
        const audioFormat = info.formats.find(f => f.mimeType.startsWith('audio/mp4'));
        if (!audioFormat) return reply("❌ Audio format for this video is not available.");
        
        const captionText = `🎧 *Now Downloading Your Song* 🎧\n\n` +
                            `*✨ Title:* ${video.title}\n` +
                            `*⏳ Duration:* ${formatDuration(video.seconds)}\n` +
                            `*👤 Author:* ${video.author.name}\n\n` +
                            `> *© ${config.BOT_NAME}*`;

        await conn.sendMessage(m.from, {
            image: { url: video.thumbnail },
            caption: captionText
        }, { quoted: mek });
        
        // Download and send the audio
        const audioStream = await ytdl.download(url, { filter: "audioonly", quality: "highestaudio" });
        
        await conn.sendMessage(m.from, {
             audio: audioStream,
             mimetype: 'audio/mpeg',
             fileName: `${video.title}.mp3`
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in new-song command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});


//================================================================================
// VIDEO DOWNLOADER COMMAND
//================================================================================
cmd({
    pattern: "new-mp4", // Command updated
    react: "🎥",
    desc: "Downloads video from YouTube.",
    category: "download",
    use: ".new-mp4 <video name or youtube url>", // Usage updated
    filename: __filename
},
async (conn, m, mek, { q, reply }) => {
    if (!q) return reply("Please provide a video name or a YouTube URL.");

    try {
        // Search for the video
        const search = await yts(q);
        const video = search.videos[0];
        if (!video) return reply("❌ Video not found. Please try a different name.");

        const url = video.url;
        const info = await ytdl.getInfo(url);
        
        // Find a format with both video and audio, preferably 720p or lower
        const format = info.formats.find(f => 
            f.hasVideo && 
            f.hasAudio && 
            (f.qualityLabel.includes('720p') || f.qualityLabel.includes('480p') || f.qualityLabel.includes('360p'))
        );

        if (!format) {
            return reply("❌ Could not find a suitable video format to download (max 720p).");
        }
        
        const captionText = `🎬 *Now Downloading Your Video* 🎬\n\n` +
                            `*✨ Title:* ${video.title}\n` +
                            `*🎞️ Quality:* ${format.qualityLabel}\n` +
                            `*⏳ Duration:* ${formatDuration(video.seconds)}\n` +
                            `*👤 Author:* ${video.author.name}\n\n` +
                            `> *© ${config.BOT_NAME}*`;
                            
        await conn.sendMessage(m.from, {
            image: { url: video.thumbnail },
            caption: captionText
        }, { quoted: mek });

        // Download and send the video
        const videoStream = await ytdl.download(url, { format: format.itag });
        
        await conn.sendMessage(m.from, {
            video: videoStream,
            mimetype: 'video/mp4',
            caption: `*${video.title}*`
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in new-mp4 command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});
