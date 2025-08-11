const fetch = require("node-fetch");
const { cmd } = require("../command");
const config = require("../config"); // Config ko import kiya taake prefix use kar sakein

cmd({
  pattern: "tiktoksearch",
  alias: ["tiktoks", "tiks"],
  desc: "Search for TikTok videos using a query.",
  react: '🎵', // Emoji ko behtar kiya gaya
  category: 'search',
  filename: __filename
}, async (conn, m, { q, from }) => { // Standard, saaf parameters
  try {
    if (!q) {
      const replyText = `🌸 What do you want to search on TikTok?\n\n*Usage Example:*\n${config.PREFIX}tiktoksearch funny cats`;
      return await conn.sendMessage(from, { text: replyText }, { quoted: m });
    }

    const query = q;
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const searchingText = `🔎 Searching TikTok for: *${query}*`;
    await conn.sendMessage(from, { text: searchingText }, { quoted: m });
    
    const response = await fetch(`https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data || !data.data || data.data.length === 0) {
      await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
      const replyText = "❌ No results found for your query. Please try with a different keyword.";
      return await conn.sendMessage(from, { text: replyText }, { quoted: m });
    }

    // Pehle 7 results lein aur unhein shuffle karein
    const results = data.data.slice(0, 7).sort(() => Math.random() - 0.5);
    
    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    for (const video of results) {
      const caption = `🌸 *TikTok Video Result*:\n\n`
        + `*• Title:* ${video.title}\n`
        + `*• Author:* ${video.author || 'Unknown'}\n`
        + `*• Duration:* ${video.duration || "Unknown"}`;

      if (video.nowm) {
        await conn.sendMessage(from, {
          video: { url: video.nowm },
          caption: caption
        }, { quoted: m });
      } else {
        const failedVideoText = `❌ Failed to retrieve video for *"${video.title}"*.`;
        await conn.sendMessage(from, { text: failedVideoText }, { quoted: m });
      }
      
      // Har video ke darmiyan thora waqfa
      await new Promise(resolve => setTimeout(resolve, 1000)); 
    }

  } catch (error) {
    console.error("Error in TikTokSearch command:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    const errorText = "❌ An error occurred while searching TikTok. The API might be down.";
    await conn.sendMessage(from, { text: errorText }, { quoted: m });
  }
});
