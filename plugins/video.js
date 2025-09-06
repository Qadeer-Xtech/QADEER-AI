const axios = require("axios");
const crypto =require("crypto");
const UserAgent = require("user-agents");
const yts = require("yt-search");
const { cmd } = require('../command'); // Make sure this path is correct

/**
 * savetube object containing the core logic for downloading from YouTube.
 * This includes API endpoints, headers, encryption/decryption, and request functions.
 */
const savetube = {
  api: {
    base: "https://media.savetube.me/api",
    cdn: "/random-cdn",
    info: "/v2/info",
    download: "/download"
  },

  headers: {
    accept: "*/*",
    "content-type": "application/json",
    origin: "https://yt.savetube.me",
    referer: "https://yt.savetube.me/",
    "user-agent": new UserAgent().toString(),
    "x-forwarded-for":
      Math.floor(Math.random() * 256) + "." +
      Math.floor(Math.random() * 256) + "." +
      Math.floor(Math.random() * 256) + "." +
      Math.floor(Math.random() * 256)
  },

  formats: ["144", "240", "360", "480", "720", "1080", "mp3"],

  crypto: {
    hexToBuffer: hexString => {
      const pairs = hexString.match(/.{1,2}/g);
      return Buffer.from(pairs.join(""), "hex");
    },
    decrypt: async encryptedBase64 => {
      try {
        const buffer = Buffer.from(encryptedBase64, "base64");
        const iv = buffer.slice(0, 16);
        const content = buffer.slice(16);
        const key = savetube.crypto.hexToBuffer("C5D58EF67A7584E4A29F6C35BBC4EB12");
        const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);
        let decrypted = decipher.update(content);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return JSON.parse(decrypted.toString());
      } catch (err) {
        throw new Error("Decryption error: " + err.message);
      }
    }
  },

  isUrl: url => {
    try { new URL(url); return true; } catch { return false; }
  },

  extractYoutubeId: url => {
    if (!url) return null;
    const patterns = [
      /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/
    ];
    for (let regex of patterns) {
      if (regex.test(url)) return url.match(regex)[1];
    }
    return null;
  },

  request: async (endpoint, params = {}, method = "post") => {
    try {
      const { data } = await axios({
        method,
        url: (endpoint.startsWith("http") ? "" : savetube.api.base) + endpoint,
        data: method === "post" ? params : undefined,
        params: method === "get" ? params : undefined,
        headers: savetube.headers
      });
      return { status: true, creator: "NBT", code: 200, response: data };
    } catch (err) {
      return { status: false, creator: "NBT", code: err.response?.status || 500, error: "Request error: " + err.message };
    }
  },

  getCDN: async () => {
    const result = await savetube.request(savetube.api.cdn, {}, "get");
    if (!result.status) return result;
    return { status: true, creator: "NBT", code: 200, response: result.response.cdn };
  },

  download: async (url, format) => {
    if (!url) return { status: false, creator: "NBT", code: 400, error: "Please provide a link to download." };
    if (!savetube.isUrl(url)) return { status: false, creator: "NBT", code: 400, error: "The provided link is not valid. Make sure it is a YouTube link." };
    if (!format || !savetube.formats.includes(format)) return { status: false, creator: "NBT", code: 400, error: "Invalid format. Use one of the available formats.", available_formats: savetube.formats };
    const videoId = savetube.extractYoutubeId(url);
    if (!videoId) return { status: false, creator: "NBT", code: 400, error: "Could not extract video ID. Check the YouTube link." };
    try {
      const cdnData = await savetube.getCDN();
      if (!cdnData.status) return cdnData;
      const cdn = cdnData.response;
      const infoResponse = await savetube.request("https://" + cdn + savetube.api.info, { url: "https://www.youtube.com/watch?v=" + videoId });
      if (!infoResponse.status) return infoResponse;
      const decryptedInfo = await savetube.crypto.decrypt(infoResponse.response.data);
      const downloadResponse = await savetube.request("https://" + cdn + savetube.api.download, { id: videoId, downloadType: format === "mp3" ? "audio" : "video", quality: format, key: decryptedInfo.key });
      return {
        status: true, creator: "NBT", code: 200,
        response: {
          title: decryptedInfo.title || "Unknown",
          type: format === "mp3" ? "audio" : "video",
          format: format,
          thumbnail: decryptedInfo.thumbnail || "https://i.ytimg.com/vi/" + videoId + "/maxresdefault.jpg",
          download: downloadResponse.response.data.downloadUrl,
          id: videoId,
          key: decryptedInfo.key,
          duration: decryptedInfo.duration,
          quality: format,
          downloaded: downloadResponse.response.data.downloaded || false
        }
      };
    } catch (err) {
      return { status: false, creator: "NBT", code: 500, error: "Error during download: " + err.message };
    }
  }
};

/**
 * Command to download a video from YouTube.
 * It can take a URL or a search query.
 * Users can also specify the video quality.
 */
cmd({
    pattern: "video3",
    alias: ["vid3", "ytvideo3"],
    react: "🎥",
    desc: "Download video from YouTube using savetube.",
    category: "download",
    use: ".video <query or url> [quality]",
    filename: __filename
}, async (conn, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a video name or YouTube URL!");

        const args = q.split(" ");
        let quality = args[args.length - 1];
        let query = q;

        const availableQualities = ["144", "240", "360", "480", "720", "1080"];
        if (availableQualities.includes(quality.replace("p", ""))) {
            query = args.slice(0, -1).join(" ");
            quality = quality.replace("p", "");
        } else {
            quality = "720"; // Default quality
        }

        let videoUrl;
        
        if (savetube.isUrl(query)) {
            videoUrl = query;
        } else {
            await reply("🔎 Searching for video...");
            const search = await yts(query);
            if (!search.videos.length) return await reply("❌ No results found!");
            videoUrl = search.videos[0].url;
        }

        await reply(`⏳ Downloading video in ${quality}p...`);

        let result = await savetube.download(videoUrl, quality);

        if (!result.status) {
            // If the requested quality is not available, try a lower one as a fallback.
            if (result.error && result.error.includes("Invalid format")) {
                 await reply(`⚠️ ${quality}p not available. Trying 360p as a fallback...`);
                 const fallbackResult = await savetube.download(videoUrl, "360");
                 if (!fallbackResult.status) {
                     return await reply(`❌ Failed to download video. Error: ${fallbackResult.error}`);
                 }
                 result = fallbackResult;
            } else {
                return await reply(`❌ Failed to download video. Error: ${result.error}`);
            }
        }

        const videoInfo = result.response;

        if (!videoInfo || !videoInfo.download) {
            return await reply("❌ Could not retrieve the download link.");
        }

        await conn.sendMessage(from, {
            video: { url: videoInfo.download },
            mimetype: 'video/mp4',
            caption: `*${videoInfo.title}*\n*Quality:* ${videoInfo.quality}p`
        }, { quoted: mek });

    } catch (error) {
        console.error("Video Download Error:", error);
        await reply(`❌ An unexpected error occurred: ${error.message}`);
    }
});