// download.js

const { fetchJson } = require('../lib/functions');
const { downloadTiktok } = require('@mrnima/tiktok-downloader');
const { facebook } = require('@mrnima/facebook-downloader');
const cheerio = require('cheerio');
const { igdl } = require('ruhend-scraper');
const axios = require('axios');
const { cmd } = require('../command');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// --- Instagram Downloader ---
cmd({
    pattern: 'ig',
    alias: ['insta', 'Instagram'],
    desc: 'To download Instagram videos.',
    category: 'download',
    filename: __filename,
    use: '<Instagram video link>'
}, async (sock, m, message, { from, q: url, reply }) => {
    try {
        if (!url || !url.startsWith('http')) {
            return reply('❌ Please provide a valid Instagram link.');
        }
        await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const response = await axios.get(`https://delirius-apiofc.vercel.app/download/instagram?url=${encodeURIComponent(url)}`);
        const result = response.data;

        if (!result || result.status !== true || !result.data?.[0]?.url) {
            return reply('⚠️ Failed to fetch Instagram video. Please check the link and try again.');
        }

        await sock.sendMessage(from, {
            video: { url: result.data[0].url },
            mimetype: 'video/mp4',
            caption: '📥 *Instagram Video Downloaded Successfully!*\n\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸* 🤖'
        }, { quoted: m });

    } catch (error) {
        console.error("Error:", error);
        reply('❌ An error occurred while processing your request. Please try again.');
    }
});


// --- Twitter Downloader ---
cmd({
    pattern: 'twitter',
    alias: ['twdl', 'tweet', 'x'],
    desc: 'Download Twitter videos',
    category: 'download',
    filename: __filename,
    use: '<Twitter video link>'
}, async (sock, m, activeSessions, { from, q: url, reply }) => {
    try {
        if (!url || !url.startsWith('https://')) {
            return sock.sendMessage(from, { text: '❌ Please provide a valid Twitter URL.' }, { quoted: m });
        }
        await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const response = await axios.get(`https://www.dark-yasiya-api.site/download/twitter?url=${encodeURIComponent(url)}`);
        const result = response.data;

        if (!result || !result.status || !result.result) {
            return reply('⚠️ Failed to retrieve Twitter video. Please check the link and try again.');
        }

        const { desc, thumb, video_hd, video_sd, audio } = result.result;
        const videoUrl = video_hd || video_sd;
        const audioUrl = audio;
        const thumbnailUrl = thumb || 'https://telegra.ph/file/6b4a85b6e4e9650e6a0c6.jpg';

        if (!videoUrl) {
            return reply('⚠️ No video found in the Twitter link. It might be text-only or protected.');
        }

        const optionsText = `╭━━━〔 *TWITTER DOWNLOADER* 〕━━━⊷\n` +
            `┃▸ *Description:* ${desc || 'No description'}\n` +
            `┃▸ *Quality:* ${video_hd ? 'HD' : (video_sd ? 'SD' : 'Unknown')}\n` +
            `╰━━━━━━━━━━━━━━━━━━━┈⊷\n\n` +
            `📹 *Download Options:*\n` +
            `1️⃣  *Video Download*\n` +
            `🎵 *Audio Options:*\n` +
            `2️⃣  *Audio*\n` +
            `3️⃣  *Document*\n` +
            `4️⃣  *Voice*\n\n` +
            `📌 *Reply with the number to download your choice.*\n\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸* 🤖`;

        const sentMessage = await sock.sendMessage(from, { image: { url: thumbnailUrl }, caption: optionsText }, { quoted: m });
        const messageId = sentMessage.key.id;

        // Store session data for this specific message
        activeSessions[messageId] = { videoUrl, audioUrl };

        // Listener for the user's reply
        sock.ev.on('messages.upsert', async ({ messages }) => {
            const receivedMessage = messages[0];
            if (!receivedMessage.message) return;

            const choice = receivedMessage.message.conversation || receivedMessage.message.extendedTextMessage?.text;
            const remoteJid = receivedMessage.key.remoteJid;
            const isReplyToBot = receivedMessage.message.extendedTextMessage?.contextInfo?.stanzaId === messageId;

            if (isReplyToBot && activeSessions[messageId]) {
                await sock.sendMessage(remoteJid, { react: { text: '⬇️', key: receivedMessage.key } });
                const { videoUrl, audioUrl } = activeSessions[messageId];

                try {
                    switch (choice) {
                        case '1':
                            await sock.sendMessage(remoteJid, { video: { url: videoUrl }, caption: '📥 *Downloaded Twitter Video*' }, { quoted: receivedMessage });
                            break;
                        case '2':
                            await sock.sendMessage(remoteJid, { audio: { url: audioUrl || videoUrl }, mimetype: 'audio/mp4' }, { quoted: receivedMessage });
                            break;
                        case '3':
                            await sock.sendMessage(remoteJid, { document: { url: audioUrl || videoUrl }, mimetype: 'audio/mp4', fileName: 'Twitter_Audio.mp4', caption: '📥 *Audio Downloaded as Document*' }, { quoted: receivedMessage });
                            break;
                        case '4':
                            await sock.sendMessage(remoteJid, { audio: { url: audioUrl || videoUrl }, mimetype: 'audio/mp4', ptt: true }, { quoted: receivedMessage });
                            break;
                        default:
                            reply('❌ Invalid option! Please reply with 1, 2, 3, or 4.');
                    }
                } catch (sendError) {
                    console.error("Download error:", sendError);
                    reply('❌ Failed to send media. The file might be too large or corrupted.');
                } finally {
                    // Clean up the session
                    delete activeSessions[messageId];
                }
            }
        });

    } catch (error) {
        console.error("Twitter Downloader Error:", error);
        reply(`❌ An error occurred: ${error.message || 'Please try again later.'}`);
    }
});


// --- MediaFire Downloader ---
cmd({
    pattern: 'mediafire',
    alias: ['mfire'],
    desc: 'To download MediaFire files.',
    category: 'download',
    filename: __filename,
    use: '<MediaFire file link>'
}, async (sock, m, message, { from, q: url, reply }) => {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '🎥', key: m.key } });
    try {
        if (!url) return reply('❌ Please provide a valid MediaFire link.');
        await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const response = await axios.get(`https://www.dark-yasiya-api.site/download/mfire?url=${url}`);
        const result = response.data;

        if (!result || !result.status || !result.result || !result.result.dl_link) {
            return reply('⚠️ Failed to fetch MediaFire download link. Ensure the link is valid and public.');
        }

        const { dl_link, fileName, fileType } = result.result;
        const finalFileName = fileName || 'mediafire_download';
        const finalMimeType = fileType || 'application/octet-stream';

        await sock.sendMessage(from, { react: { text: '⬆️', key: m.key } });
        const caption = `╭━━━〔 *MEDIAFIRE DOWNLOADER* 〕━━━⊷\n` +
            `┃▸ *File Name:* ${finalFileName}\n` +
            `┃▸ *File Type:* ${finalMimeType}\n` +
            `╰━━━⪼\n\n` +
            `🔗 *𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖*`;

        await sock.sendMessage(from, {
            document: { url: dl_link },
            mimetype: finalMimeType,
            fileName: finalFileName,
            caption: caption
        }, { quoted: m });

    } catch (error) {
        console.error("Error:", error);
        reply('❌ An error occurred while fetching the MOD APK info.');
    }
});


// --- MOD APK Search ---
cmd({
    pattern: 'modapk',
    alias: ['apk2'],
    desc: 'Search MOD APKs',
    category: 'download',
    filename: __filename,
    use: '<app name>'
}, async (sock, m, message, { from, q: query, reply }) => {
    try {
        if (!query) return reply('❌ Please provide an app name to search.');
        await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `https://api.nekorinn.my.id/search/apkcombo?q=${encodeURIComponent(query)}`;
        const { data: response } = await axios.get(apiUrl);

        if (!response.status || !response.result || !response.result.length) {
            return reply(`⚠️ No MOD APKs found for "${query}".`);
        }

        const appInfo = response.result[0];
        const caption = `╭━━━〔 *MOD APK Downloader* 〕━━━┈⊷\n` +
            `┃ 📦 *Title:* ${appInfo.name}\n` +
            `┃ 👨‍💻 *Developer:* ${appInfo.developer || 'N/A'}\n` +
            `┃ 🆚 *Version:* ${appInfo.version || 'N/A'}\n` +
            `┃ 🏋 *Size:* ${appInfo.size || 'N/A'}\n` +
            `╰━━━━━━━━━━━━━━━┈⊷\n` +
            `🔗 *Download:* ${appInfo.url}\n\n` +
            `🔗 *𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖*`;

        await sock.sendMessage(from, { image: { url: appInfo.icon }, caption: caption }, { quoted: m });
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('MOD APK Downloader Error:', error);
        reply('❌ An error occurred while fetching the MOD APK info.');
    }
});

// --- Google Drive Downloader ---
cmd({
    pattern: 'gdrive',
    alias: ['gdrive-dl', 'googledrive'],
    desc: 'Download Google Drive files.',
    react: '🌐',
    category: 'download',
    filename: __filename,
    use: '<Google Drive file link>'
}, async (sock, m, message, { from, q: url, reply }) => {
    try {
        if (!url) return reply('❌ Please provide a valid Google Drive link.');
        await sock.sendMessage(from, { react: { text: '⬇️', key: m.key } });

        const apiUrl = `https://api.fgmods.xyz/api/downloader/gdrive?url=${url}&apikey=mnp3grlZ`;
        const response = await axios.get(apiUrl);
        const downloadUrl = response.data.result.downloadUrl;

        if (downloadUrl) {
            await sock.sendMessage(from, { react: { text: '⬆️', key: m.key } });
            await sock.sendMessage(from, {
                document: { url: downloadUrl },
                mimetype: response.data.result.mimetype,
                fileName: response.data.result.fileName,
                caption: '📥 *Downloading your file...*\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸* 🤖'
            }, { quoted: m });
            await sock.sendMessage(from, { react: { text: '✅', key: m.key } });
        } else {
            return reply('⚠️ No download URL found. Please check the link and try again.');
        }
    } catch (error) {
        console.error("Unknown", error);
        reply('❌ An error occurred while fetching the Google Drive file. Please try again.');
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


