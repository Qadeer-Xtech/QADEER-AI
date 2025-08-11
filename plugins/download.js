const { fetchJson } = require("../lib/functions");
const { downloadTiktok } = require("@mrnima/tiktok-downloader");
const { facebook } = require("@mrnima/facebook-downloader");
const cheerio = require("cheerio");
const { igdl } = require("ruhend-scraper");
const axios = require("axios");
const { cmd, commands } = require('../command');

// apk command

cmd({
  pattern: "apk",
  desc: "Download APK from Aptoide.",
  category: "download",
  filename: __filename
}, async (conn, m, { q, from }) => {
  try {
    if (!q) {
      const replyText = "❌ Please provide an app name to search.";
      return await conn.sendMessage(from, { text: replyText }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${q}/limit=1`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.datalist || !data.datalist.list.length) {
      const replyText = "⚠️ No results found for the given app name.";
      return await conn.sendMessage(from, { text: replyText }, { quoted: m });
    }

    const app = data.datalist.list[0];
    const appSize = (app.size / 1048576).toFixed(2); // Convert bytes to MB

    const caption = `╭━━━〔 *APK Downloader* 〕━━━┈⊷
┃ 📦 *Name:* ${app.name}
┃ 🏋 *Size:* ${appSize} MB
┃ 📦 *Package:* ${app.package}
┃ 📅 *Updated On:* ${app.updated}
┃ 👨‍💻 *Developer:* ${app.developer.name}
╰━━━━━━━━━━━━━━━┈⊷`;

    await conn.sendMessage(from, {
      document: { url: app.file.path_alt },
      fileName: `${app.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption: caption
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    const errorText = "❌ An error occurred while fetching the APK. Please try again.";
    await conn.sendMessage(from, { text: errorText }, { quoted: m });
  }
});

// mediafire command

cmd({
  pattern: "mediafire",
  alias: ["mfire"],
  desc: "To download MediaFire files.",
  react: "📁",
  category: "download",
  filename: __filename
}, async (conn, m, { q, from }) => {
  try {
    if (!q) {
      const replyText = "❌ Please provide a valid MediaFire link.";
      return await conn.sendMessage(from, { text: replyText }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const response = await axios.get(`https://www.dark-yasiya-api.site/download/mfire?url=${q}`);
    const data = response.data;

    if (!data || !data.status || !data.result || !data.result.dl_link) {
      const replyText = "⚠️ Failed to fetch MediaFire download link. Ensure the link is valid and public.";
      return await conn.sendMessage(from, { text: replyText }, { quoted: m });
    }

    const { dl_link, fileName, fileType } = data.result;
    const file_name = fileName || "mediafire_download";
    const mime_type = fileType || "application/octet-stream";

    const caption = `╭━━━〔 *MEDIAFIRE DOWNLOADER* 〕━━━⊷\n`
      + `┃▸ *File Name:* ${file_name}\n`
      + `┃▸ *File Type:* ${mime_type}\n`
      + `╰━━━⪼\n\n`
      + `📥 *Downloading your file...*`;

    await conn.sendMessage(from, {
      document: { url: dl_link },
      mimetype: mime_type,
      fileName: file_name,
      caption: caption
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    const errorText = "❌ An error occurred while processing your request. Please try again.";
    await conn.sendMessage(from, { text: errorText }, { quoted: m });
  }
});

// ig command

cmd({
  pattern: "ig",
  alias: ["insta", "Instagram"],
  desc: "To download Instagram videos.",
  react: "🎥",
  category: "download",
  filename: __filename
}, async (conn, m, { q, from }) => {
  try {
    if (!q || !q.startsWith("http")) {
      const replyText = "❌ Please provide a valid Instagram link.";
      return await conn.sendMessage(from, { text: replyText }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const response = await axios.get(`https://api.davidcyriltech.my.id/instagram?url=${q}`);
    const data = response.data;

    if (!data || data.status !== 200 || !data.downloadUrl) {
      const replyText = "⚠️ Failed to fetch Instagram video. Please check the link and try again.";
      return await conn.sendMessage(from, { text: replyText }, { quoted: m });
    }

    await conn.sendMessage(from, {
      video: { url: data.downloadUrl },
      mimetype: "video/mp4",
      caption: "📥 *Instagram Video Downloaded Successfully!*"
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    const errorText = "❌ An error occurred while processing your request. Please try again.";
    await conn.sendMessage(from, { text: errorText }, { quoted: m });
  }
});


cmd({
  pattern: "twitter",
  alias: ["tweet", "twdl"],
  desc: "Download Twitter videos",
  category: "download",
  filename: __filename
}, async (conn, m, { q, from }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return await conn.sendMessage(from, { text: "❌ Please provide a valid Twitter URL." }, { quoted: m });
    }

    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    const response = await axios.get(`https://www.dark-yasiya-api.site/download/twitter?url=${q}`);
    const data = response.data;

    if (!data || !data.status || !data.result) {
      const replyText = "⚠️ Failed to retrieve Twitter video. Please check the link and try again.";
      return await conn.sendMessage(from, { text: replyText }, { quoted: m });
    }

    const { desc, thumb, video_sd, video_hd } = data.result;
    const caption = `╭━━━〔 *TWITTER DOWNLOADER* 〕━━━⊷\n`
      + `┃▸ *Description:* ${desc || "No description"}\n`
      + `╰━━━⪼\n\n`
      + `📹 *Download Options:*\n`
      + `1️⃣  *SD Quality*\n`
      + `2️⃣  *HD Quality*\n`
      + `🎵 *Audio Options:*\n`
      + `3️⃣  *Audio*\n`
      + `4️⃣  *Document*\n`
      + `5️⃣  *Voice*\n\n`
      + `📌 *Reply with the number to download your choice.*`;

    const sentMsg = await conn.sendMessage(from, { image: { url: thumb }, caption: caption }, { quoted: m });
    const messageID = sentMsg.key.id;

    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        await conn.sendMessage(senderID, { react: { text: '⬇️', key: receivedMsg.key } });

        switch (receivedText) {
          case "1": await conn.sendMessage(senderID, { video: { url: video_sd }, caption: "📥 *Downloaded in SD Quality*" }, { quoted: receivedMsg }); break;
          case "2": await conn.sendMessage(senderID, { video: { url: video_hd }, caption: "📥 *Downloaded in HD Quality*" }, { quoted: receivedMsg }); break;
          case "3": await conn.sendMessage(senderID, { audio: { url: video_sd }, mimetype: "audio/mpeg" }, { quoted: receivedMsg }); break;
          case "4.": await conn.sendMessage(senderID, { document: { url: video_sd }, mimetype: "audio/mpeg", fileName: "Twitter_Audio.mp3" }, { quoted: receivedMsg }); break;
          case "5": await conn.sendMessage(senderID, { audio: { url: video_sd }, mimetype: "audio/mp4", ptt: true }, { quoted: receivedMsg }); break;
          default:
            await conn.sendMessage(senderID, { text: "❌ Invalid option! Please reply with 1, 2, 3, 4, or 5." }, { quoted: receivedMsg });
        }
      }
    });

  } catch (error) {
    console.error("Error:", error);
    const errorText = "❌ An error occurred while processing your request. Please try again.";
    await conn.sendMessage(from, { text: errorText }, { quoted: m });
  }
});
