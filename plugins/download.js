const { fetchJson } = require("../lib/functions");
const { downloadTiktok } = require("@mrnima/tiktok-downloader");
const { facebook } = require("@mrnima/facebook-downloader");
const cheerio = require("cheerio");
const { igdl } = require("ruhend-scraper");
const fetch = require("node-fetch");
const axios = require("axios");
const { cmd, commands } = require('../command');

cmd({
  pattern: "ig",
  alias: ["insta", "Instagram"],
  desc: "To download Instagram videos.",
  react: "🎥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("❌ Please provide a valid Instagram link.");
    }

    await conn.sendMessage(from, {
      react: { text: "⏳", key: m.key }
    });

    const response = await axios.get(`https://api.davidcyriltech.my.id/instagram?url=${q}`);
    const data = response.data;

    if (!data || data.status !== 200 || !data.downloadUrl) {
      return reply("⚠️ Failed to fetch Instagram video. Please check the link and try again.");
    }

    await conn.sendMessage(from, {
      video: { url: data.downloadUrl },
      mimetype: "video/mp4",
      caption: "📥 *Instagram Video Downloaded Successfully!*"
    }, { quoted: m });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while processing your request. Please try again.");
  }
});


// twitter-dl

cmd({
  pattern: "twitter",
  alias: ["tweet", "twdl"],
  desc: "Download Twitter videos",
  category: "download",
  filename: __filename
}, async (conn, m, store, {
  from,
  quoted,
  q,
  reply
}) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ Please provide a valid Twitter URL." }, { quoted: m });
    }

    await conn.sendMessage(from, {
      react: { text: '⏳', key: m.key }
    });

    const response = await axios.get(`https://www.dark-yasiya-api.site/download/twitter?url=${q}`);
    const data = response.data;

    if (!data || !data.status || !data.result) {
      return reply("⚠️ Failed to retrieve Twitter video. Please check the link and try again.");
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

    const sentMsg = await conn.sendMessage(from, {
      image: { url: thumb },
      caption: caption
    }, { quoted: m });

    const messageID = sentMsg.key.id;

    conn.ev.on("messages.upsert", async (msgData) => {
      const receivedMsg = msgData.messages[0];
      if (!receivedMsg.message) return;

      const receivedText = receivedMsg.message.conversation || receivedMsg.message.extendedTextMessage?.text;
      const senderID = receivedMsg.key.remoteJid;
      const isReplyToBot = receivedMsg.message.extendedTextMessage?.contextInfo?.stanzaId === messageID;

      if (isReplyToBot) {
        await conn.sendMessage(senderID, {
          react: { text: '⬇️', key: receivedMsg.key }
        });

        switch (receivedText) {
          case "1":
            await conn.sendMessage(senderID, {
              video: { url: video_sd },
              caption: "📥 *Downloaded in SD Quality*"
            }, { quoted: receivedMsg });
            break;

          case "2":
            await conn.sendMessage(senderID, {
              video: { url: video_hd },
              caption: "📥 *Downloaded in HD Quality*"
            }, { quoted: receivedMsg });
            break;

          case "3":
            await conn.sendMessage(senderID, {
              audio: { url: video_sd },
              mimetype: "audio/mpeg"
            }, { quoted: receivedMsg });
            break;

          case "4":
            await conn.sendMessage(senderID, {
              document: { url: video_sd },
              mimetype: "audio/mpeg",
              fileName: "Twitter_Audio.mp3",
              caption: "📥 *Audio Downloaded as Document*"
            }, { quoted: receivedMsg });
            break;

          case "5":
            await conn.sendMessage(senderID, {
              audio: { url: video_sd },
              mimetype: "audio/mp4",
              ptt: true
            }, { quoted: receivedMsg });
            break;

          default:
            reply("❌ Invalid option! Please reply with 1, 2, 3, 4, or 5.");
        }
      }
    });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while processing your request. Please try again.");
  }
});

// MediaFire-dl

cmd({
  pattern: "mediafire",
  alias: ["mfire"],
  desc: "Download MediaFire files safely (streaming).",
  react: "📂",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.includes("mediafire.com")) {
      return reply("❌ Please provide a valid MediaFire link.");
    }

    // React: processing
    await conn.sendMessage(from, {
      react: { text: "⏳", key: m.key }
    });

    // Get MediaFire file details from API
    const response = await axios.get(`https://www.dark-yasiya-api.site/download/mfire?url=${encodeURIComponent(q)}`);
    const data = response.data;

    if (!data || !data.status || !data.result || !data.result.dl_link) {
      return reply("⚠️ Failed to fetch MediaFire download link. Ensure the link is valid and public.");
    }

    const { dl_link, fileName, fileType, size } = data.result;
    const file_name = fileName || "mediafire_file";
    const mime_type = fileType || "application/octet-stream";

    // Check if file link is valid
    const headRes = await axios.head(dl_link).catch(() => null);
    if (!headRes || headRes.status !== 200) {
      return reply("⚠️ Download link is not accessible. It may be expired or blocked.");
    }

    // Caption
    const caption = `╭━━━〔 *MEDIAFIRE DOWNLOADER* 〕━━━⊷
┃▸ *File Name:* ${file_name}
┃▸ *File Type:* ${mime_type}
┃▸ *Size:* ${size || "Unknown"}
╰━━━⪼
📥 *Downloading your file...*`;

    // Stream file directly to WhatsApp
    const fileStream = await fetch(dl_link);
    await conn.sendMessage(from, {
      document: fileStream.body,
      fileName: file_name,
      mimetype: mime_type,
      caption: caption
    }, { quoted: m });

    // React: success
    await conn.sendMessage(from, {
      react: { text: "✅", key: m.key }
    });

  } catch (error) {
    console.error("MediaFire Error:", error);
    reply("❌ An error occurred while processing your MediaFire request.");
  }
});

// apk-dl

cmd({
  pattern: "apk",
  desc: "Download APK from Aptoide.",
  category: "download",
  filename: __filename
}, async (conn, m, store, {
  from,
  quoted,
  q,
  reply
}) => {
  try {
    if (!q) {
      return reply("❌ Please provide an app name to search.");
    }

    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${q}/limit=1`;
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!data || !data.datalist || !data.datalist.list.length) {
      return reply("⚠️ No results found for the given app name.");
    }

    const app = data.datalist.list[0];
    const appSize = (app.size / 1048576).toFixed(2); // Convert bytes to MB

    const caption = `╭━━━〔 *APK Downloader* 〕━━━┈⊷
┃ 📦 *Name:* ${app.name}
┃ 🏋 *Size:* ${appSize} MB
┃ 📦 *Package:* ${app.package}
┃ 📅 *Updated On:* ${app.updated}
┃ 👨‍💻 *Developer:* ${app.developer.name}
╰━━━━━━━━━━━━━━━┈⊷
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ǫᴀᴅᴇᴇʀ ᴋʜᴀɴ*`;

    await conn.sendMessage(from, { react: { text: "⬆️", key: m.key } });

    await conn.sendMessage(from, {
      document: { url: app.file.path_alt },
      fileName: `${app.name}.apk`,
      mimetype: "application/vnd.android.package-archive",
      caption: caption
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Error:", error);
    reply("❌ An error occurred while fetching the APK. Please try again.");
  }
});


// ===================NEW ADDED====================

// YTMP3 - YouTube Audio Downloader
cmd({
  pattern: "ytmp3",
  alias: ["yt-audio", "youtube-mp3"],
  desc: "Download YouTube audio in MP3 format.",
  react: "📥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("❌ Please provide a valid YouTube link.\nExample: ytmp3 https://youtube.com/watch?v=xyz");
    }
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const res = await axios.get(`https://bk9.fun/download/ytmp3?q=${encodeURIComponent(q)}`);
    if (!res.data || (!res.data.link && !res.data.url)) {
      return reply("⚠️ Failed to fetch YouTube audio.");
    }

    await conn.sendMessage(from, {
      document: { url: res.data.link || res.data.url },
      fileName: "YouTube_Audio.mp3",
      mimetype: "audio/mpeg",
      caption: "📥 *YouTube Audio Downloaded Successfully!*"
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while processing your request.");
  }
});

// YTMP4 - YouTube Video Downloader
cmd({
  pattern: "ytmp4",
  alias: ["yt-video", "youtube-mp4"],
  desc: "Download YouTube video in MP4 format.",
  react: "📥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("❌ Please provide a valid YouTube link.\nExample: ytmp4 https://youtube.com/watch?v=xyz");
    }
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const res = await axios.get(`https://bk9.fun/download/ytmp4?q=${encodeURIComponent(q)}`);
    if (!res.data || (!res.data.link && !res.data.url)) {
      return reply("⚠️ Failed to fetch YouTube video.");
    }

    await conn.sendMessage(from, {
      video: { url: res.data.link || res.data.url },
      mimetype: "video/mp4",
      caption: "📥 *YouTube Video Downloaded Successfully!*"
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while processing your request.");
  }
});

// Facebook1 Downloader
cmd({
  pattern: "facebook1",
  alias: ["fb1", "fbdown1"],
  desc: "Download Facebook videos.",
  react: "📥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("❌ Please provide a valid Facebook link.\nExample: facebook1 https://facebook.com/video/xyz");
    }
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const res = await axios.get(`https://bk9.fun/download/facebook?q=${encodeURIComponent(q)}`);
    if (!res.data || (!res.data.link && !res.data.url)) {
      return reply("⚠️ Failed to fetch Facebook video.");
    }

    await conn.sendMessage(from, {
      video: { url: res.data.link || res.data.url },
      mimetype: "video/mp4",
      caption: "📥 *Facebook Video Downloaded Successfully!*"
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while processing your request.");
  }
});

// Instagram1 Downloader
cmd({
  pattern: "instagram1",
  alias: ["ig1", "igdown1"],
  desc: "Download Instagram videos.",
  react: "📥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("❌ Please provide a valid Instagram link.\nExample: instagram1 https://instagram.com/reel/xyz");
    }
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const res = await axios.get(`https://bk9.fun/download/instagram?q=${encodeURIComponent(q)}`);
    if (!res.data || (!res.data.link && !res.data.url)) {
      return reply("⚠️ Failed to fetch Instagram video.");
    }

    await conn.sendMessage(from, {
      video: { url: res.data.link || res.data.url },
      mimetype: "video/mp4",
      caption: "📥 *Instagram Video Downloaded Successfully!*"
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while processing your request.");
  }
});

// TikTok1 Downloader
cmd({
  pattern: "tiktok1",
  alias: ["tt1", "ttdown1"],
  desc: "Download TikTok videos.",
  react: "📥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("❌ Please provide a valid TikTok link.\nExample: tiktok1 https://tiktok.com/@user/video/xyz");
    }
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const res = await axios.get(`https://bk9.fun/download/tiktok?q=${encodeURIComponent(q)}`);
    if (!res.data || (!res.data.link && !res.data.url)) {
      return reply("⚠️ Failed to fetch TikTok video.");
    }

    await conn.sendMessage(from, {
      video: { url: res.data.link || res.data.url },
      mimetype: "video/mp4",
      caption: "📥 *TikTok Video Downloaded Successfully!*"
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while processing your request.");
  }
});

// Twitter1 Downloader
cmd({
  pattern: "twitter1",
  alias: ["x1", "twdown1"],
  desc: "Download Twitter videos.",
  react: "📥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("❌ Please provide a valid Twitter link.\nExample: twitter1 https://twitter.com/user/status/xyz");
    }
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const res = await axios.get(`https://bk9.fun/download/twitter?q=${encodeURIComponent(q)}`);
    if (!res.data || (!res.data.link && !res.data.url)) {
      return reply("⚠️ Failed to fetch Twitter video.");
    }

    await conn.sendMessage(from, {
      video: { url: res.data.link || res.data.url },
      mimetype: "video/mp4",
      caption: "📥 *Twitter Video Downloaded Successfully!*"
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while processing your request.");
  }
});

// SoundCloud Downloader
cmd({
  pattern: "soundcloud",
  alias: ["sc", "scdown"],
  desc: "Download SoundCloud audio.",
  react: "📥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("❌ Please provide a valid SoundCloud link.\nExample: soundcloud https://soundcloud.com/user/songxyz");
    }
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const res = await axios.get(`https://bk9.fun/download/soundcloud?q=${encodeURIComponent(q)}`);
    if (!res.data || (!res.data.link && !res.data.url)) {
      return reply("⚠️ Failed to fetch SoundCloud audio.");
    }

    await conn.sendMessage(from, {
      document: { url: res.data.link || res.data.url },
      fileName: "SoundCloud_Audio.mp3",
      mimetype: "audio/mpeg",
      caption: "📥 *SoundCloud Audio Downloaded Successfully!*"
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while processing your request.");
  }
});

// Spotify Downloader
cmd({
  pattern: "spotify",
  alias: ["sp", "spotifydown"],
  desc: "Download Spotify tracks.",
  react: "📥",
  category: "download",
  filename: __filename
}, async (conn, m, store, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("http")) {
      return reply("❌ Please provide a valid Spotify link.\nExample: spotify https://open.spotify.com/track/xyz");
    }
    await conn.sendMessage(from, { react: { text: "⏳", key: m.key } });

    const res = await axios.get(`https://bk9.fun/download/spotify?q=${encodeURIComponent(q)}`);
    if (!res.data || (!res.data.link && !res.data.url)) {
      return reply("⚠️ Failed to fetch Spotify track.");
    }

    await conn.sendMessage(from, {
      document: { url: res.data.link || res.data.url },
      fileName: "Spotify_Track.mp3",
      mimetype: "audio/mpeg",
      caption: "📥 *Spotify Track Downloaded Successfully!*"
    }, { quoted: m });

    await conn.sendMessage(from, { react: { text: "✅", key: m.key } });
  } catch (e) {
    console.error(e);
    reply("❌ An error occurred while processing your request.");
  }
});