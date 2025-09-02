const axios = require("axios");
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require("path");
const { cmd, commands } = require("../command");

cmd({
  pattern: "tourl",
  alias: ["imgtourl", "imgurl", "url", "geturl", "upload"],
  react: '🖇',
  desc: "Convert media to Catbox URL",
  category: "utility",
  use: ".tourl [reply to media]",
  filename: __filename
}, async (client, message, args, { reply }) => {
  try {
    const quotedMsg = message.quoted ? message.quoted : message;
    const mimeType = (quotedMsg.msg || quotedMsg).mimetype || '';
    if (!mimeType) throw "Please reply to an image, video, or audio file";

    const mediaBuffer = await quotedMsg.download();
    if (mediaBuffer.length > 100 * 1024 * 1024) throw "File too large. Max: 100MB.";

    const extension = getExtension(mimeType);
    const tempFilePath = path.join(os.tmpdir(), `upload_${Date.now()}${extension}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);

    // Upload to Catbox
    try {
      const mediaUrl = await uploadToCatbox(tempFilePath);
      await reply(formatSuccess(mediaBuffer.length, mimeType, mediaUrl));
    } catch (err) {
      console.warn("Catbox failed, trying uguu:", err.message);
      const mediaUrl = await uploadToUguu(tempFilePath);
      await reply(formatSuccess(mediaBuffer.length, mimeType, mediaUrl, 'Uguu'));
    }

    fs.unlinkSync(tempFilePath);
  } catch (error) {
    console.error("Erreur dans .tourl :", error);
    await reply(`Error: ${error.message || error}`);
  }
});

function getExtension(mimeType) {
  if (mimeType.includes('jpeg')) return '.jpg';
  if (mimeType.includes('png')) return '.png';
  if (mimeType.includes('webp')) return '.webp';
  if (mimeType.includes('mp4')) return '.mp4';
  if (mimeType.includes('webm')) return '.webm';
  if (mimeType.includes('mpeg')) return '.mp3';
  if (mimeType.includes('ogg')) return '.ogg';
  return '.bin';
}

function formatSuccess(size, mime, url, service = 'Catbox') {
  let type = 'File';
  if (mime.includes('image')) type = 'Image';
  else if (mime.includes('video')) type = 'Video';
  else if (mime.includes('audio')) type = 'Audio';

  return (
    `*${type} Uploaded Successfully to ${service}*\n\n` +
    `*Size:* ${formatBytes(size)}\n` +
    `*URL:* ${url}\n\n` +
    `> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽* 🤍`
  );
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function uploadToCatbox(filePath) {
  const form = new FormData();
  form.append('fileToUpload', fs.createReadStream(filePath));
  form.append('reqtype', 'fileupload');

  const res = await axios.post("https://catbox.moe/user/api.php", form, {
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'Mozilla/5.0'
    },
    timeout: 60000
  });

  if (!res.data || !res.data.includes("https://")) {
    throw new Error("Invalid Catbox response");
  }

  return res.data;
}

async function uploadToUguu(filePath) {
  const form = new FormData();
  form.append('files[]', fs.createReadStream(filePath));

  const res = await axios.post("https://uguu.se/upload.php", form, {
    headers: form.getHeaders(),
    timeout: 60000
  });

  if (!res.data || !res.data.files || !res.data.files[0] || !res.data.files[0].url) {
    throw new Error("Invalid Uguu response");
  }

  return res.data.files[0].url;
}