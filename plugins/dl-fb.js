const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "fb",
  alias: ["facebook", "fbdl"],
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename,
  use: "<Facebook URL>",
}, async (conn, m, store, { from, args, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("*`A valid Facebook URL is required`*\n\nExample: `.fb https://www.facebook.com/...`");
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const apiUrl = `https://www.velyn.biz.id/api/downloader/facebookdl?url=${encodeURIComponent(q)}`;
    const res = await axios.get(apiUrl);

    if (!res.data || res.data.status !== true || !res.data.data || !res.data.data.url) {
      return reply("❌ Failed to fetch the video. Please try a different link.");
    }

    const videoUrl = res.data.data.url;

    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption: "📥 *Facebook Video Downloaded Successfully*\n\n> *𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽* ✅",
    }, { quoted: m });

  } catch (error) {
    console.error("Facebook download error:", error?.response?.data || error.message);
    reply("❌ An error occurred while downloading the video. Please check the link or try again later.");
  }
});
