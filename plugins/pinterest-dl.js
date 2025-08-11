const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "pindl",
    alias: ["pinterestdl", "pin", "pins", "pindownload"],
    desc: "Download media from a Pinterest URL.",
    category: "download",
    react: "📌",
    filename: __filename,
}, async (conn, m, { q, from }) => {
    try {
        if (!q || !q.includes("pinterest.com")) {
            const replyText = "❎ Please provide a valid Pinterest URL to download from.";
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }

        const pinterestUrl = q;
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `https://api.giftedtech.web.id/api/download/pinterestdl?apikey=gifted&url=${encodeURIComponent(pinterestUrl)}`;
        const response = await axios.get(apiUrl);

        if (!response.data.success || !response.data.result) {
            const replyText = "❎ Failed to fetch data from Pinterest. The link might be invalid or private.";
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }

        const { media, description, title } = response.data.result;

        if (!media || media.length === 0) {
            return await conn.sendMessage(from, { text: "❎ No downloadable media found at this URL." }, { quoted: m });
        }

        // 720p video ko tarjeeh dein, warna pehli available video/image lein
        const bestQualityMedia = media.find(item => item.type.includes('720p')) || media[0];
        const downloadUrl = bestQualityMedia.download_url;
        const mediaType = bestQualityMedia.type;

        const caption = `╭━━━〔 *PINTEREST DOWNLOAD* 〕━━━┈⊷
┃
┃   *✨ Title:* ${title || 'Not Available'}
┃   *📝 Desc:* ${description || 'Not Available'}
┃
╰─────────────────⎔
> *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ǫᴀᴅᴇᴇʀ ᴀɪ*`;

        // Media type ke hisab se video ya image bhejain
        if (mediaType.includes('Video')) {
            await conn.sendMessage(from, { 
                video: { url: downloadUrl }, 
                caption: caption 
            }, { quoted: m });
        } else {
            await conn.sendMessage(from, { 
                image: { url: downloadUrl }, 
                caption: caption 
            }, { quoted: m });
        }

    } catch (e) {
        console.error("Pinterest DL Error:", e);
        const errorText = "❎ An error occurred while processing your request. The API might be down.";
        await conn.sendMessage(from, { text: errorText }, { quoted: m });
    }
});
