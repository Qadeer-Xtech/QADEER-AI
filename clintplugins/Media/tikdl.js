const fetch = require("node-fetch");

module.exports = async (context) => {
    const { client, m, text, prefix } = context;

    try {
        if (!text) return m.reply(`did you forget your brain at home? where's the tiktok link?\nexample: ${prefix}tt https://vt.tiktok.com/xxxxx`);
        if (!text.includes("tiktok.com")) return m.reply("are you fucking blind? that's not a tiktok link! tiktok links contain 'tiktok.com', you absolute potato.");

        await client.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

        const encodedUrl = encodeURIComponent(text);
        const response = await fetch(`https://api.nekolabs.web.id/downloader/tiktok?url=${encodedUrl}`);
        const data = await response.json();

        if (!data?.success || !data?.result?.videoUrl) {
            await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return m.reply("failed to download that garbage tiktok! either the link is dead or your taste in content is so bad even the api rejected it.");
        }

        const videoUrl = data.result.videoUrl;
        const musicUrl = data.result.musicUrl;
        const username = data.result.author?.username || "unknown";
        const authorName = data.result.author?.name || "unknown";
        const stats = data.result.stats || {};
        const musicInfo = data.result.music_info || {};

        await client.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        const videoResponse = await fetch(videoUrl);
        const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());

        const caption = `◈━━━━━━━━━━━━━━━◈\n│❒ tiktok download ✅\n│❒ author: ${authorName}\n│❒ username: ${username}\n│❒ views: ${stats.play || "0"}\n│❒ likes: ${stats.like || "0"}\n│❒ comments: ${stats.comment || "0"}\n│❒ shares: ${stats.share || "0"}\n│❒ music: ${musicInfo.title || "none"}\n│❒ artist: ${musicInfo.author || "none"}\n│❒ 𝚀𝚊𝚍𝚎𝚎𝚛-𝚊𝚒\n◈━━━━━━━━━━━━━━━◈`;

        await client.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: "video/mp4",
            caption: caption
        }, { quoted: m });

        if (musicUrl) {
            try {
                const musicResponse = await fetch(musicUrl);
                const musicBuffer = Buffer.from(await musicResponse.arrayBuffer());

                await client.sendMessage(m.chat, {
                    audio: musicBuffer,
                    mimetype: "audio/mpeg",
                    ptt: false,
                    fileName: `${musicInfo.title || 'tiktok_audio'}.mp3`
                });
            } catch (audioError) {
                console.log("audio extraction failed:", audioError.message);
            }
        }

    } catch (error) {
        console.error("tiktok error:", error);
        await client.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await m.reply(`the fuck? tiktok download crashed harder than your iq.\nerror: ${error.message}\ntry again or go touch grass.`);
    }
};