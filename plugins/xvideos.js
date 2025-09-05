const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "xvideos",
    alias: ["xvid", "xvideossearch"],
    desc: "Search for videos on Xvideos.",
    category: "hot",
    react: "😈",
    filename: __filename
},
async (conn, m, store, { from, reply, q, pushname, botname }) => {
    
    // Check if a search query is provided
    if (!q) {
        return reply('😡 Bro, give me something to search!\n\n*Example:*\n.xvideos hot milf');
    }

    try {
        // Sanitize the search query
        const sanitizedQuery = q.trim().slice(0, 50).replace(/[^a-zA-Z0-9\s]/g, '');

        if (sanitizedQuery.length < 3) {
            return reply(`🙄 C'mon, ${pushname}, your search query is too short. Try something longer.`);
        }
        
        // 1. Search for videos using the API
        const searchApiUrl = `https://api.giftedtech.web.id/api/search/xvideossearch?apikey=gifted&query=${encodeURIComponent(sanitizedQuery)}`;
        const searchResponse = await axios.get(searchApiUrl);
        const searchData = searchResponse.data;

        if (!searchData || !searchData.success || !searchData.results || searchData.results.length === 0) {
            return reply(`😒 Sorry, no videos found for "${sanitizedQuery}". Try another keyword.`);
        }

        // 2. Pick a random video from the top 5 results
        const topResults = searchData.results.slice(0, 5);
        const randomVideo = topResults[Math.floor(Math.random() * topResults.length)];

        // 3. Get the download link for the selected video
        const downloadApiUrl = `https://api.giftedtech.web.id/api/download/xvideosdl?apikey=gifted&url=${encodeURIComponent(randomVideo.url)}`;
        const downloadResponse = await axios.get(downloadApiUrl);
        const downloadData = downloadResponse.data;

        if (!downloadData || !downloadData.success || !downloadData.result || !downloadData.result.download_url) {
            return reply(`❌ Failed to get the download link for the video, ${pushname}. Please try again.`);
        }

        // 4. Create and send the list of found videos
        let videoListMessage = `😈 Found these for "${sanitizedQuery}", ${pushname}!\nI've picked one for you:\n\n`;
        topResults.forEach((video, index) => {
            videoListMessage += `${index + 1}. *${video.title}* (${video.duration})${video.url === randomVideo.url ? ' [✅ Picked]' : ''}\n`;
        });
        videoListMessage += `\n> Powered by *${botname}*`;
        await reply(videoListMessage);

        // 5. Prepare the caption and send the final video
        const videoInfo = downloadData.result;
        const videoCaption = `😈 Here is your video, ${pushname}!\n\n` +
                             `*Title:* ${videoInfo.title}\n` +
                             `*Duration:* ${randomVideo.duration}\n` +
                             `*Views:* ${videoInfo.views}\n` +
                             `*Likes:* ${videoInfo.likes}\n` +
                             `*Size:* ${videoInfo.size}\n\n` +
                             `> Powered by *${botname}*`;

        await conn.sendMessage(from, {
            video: { url: videoInfo.download_url },
            caption: videoCaption
        }, { quoted: m });

    } catch (error) {
        console.error("Xvideos Command Error:", error);
        reply(`❌ An error occurred, ${pushname}.\n\n*Error:* ${error.message}`);
    }
});
