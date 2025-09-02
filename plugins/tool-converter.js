// tool-converter.js
const converter = require('../data/converter');
const stickerConverter = require('../data/sticker-converter');
const { cmd } = require('../command');

// Sticker to Image
cmd({
    pattern: 'convert',
    alias: ['sticker2img', 'toimg', 'stickertoimage', 's2i'],
    desc: 'Convert stickers to images',
    category: 'convert',
    filename: __filename
}, async (client, message, m, { from }) => {
    await client.sendMessage(m.key.remoteJid, { react: { text: '🖼️', key: m.key } });

    if (!m.quoted) {
        return await client.sendMessage(from, { text: '✨ *Sticker Converter*\n\nPlease reply to a sticker message\n\nExample: `.convert` (reply to sticker)' }, { quoted: m });
    }
    if (m.quoted.mtype !== 'stickerMessage') {
        return await client.sendMessage(from, { text: '❌ Only sticker messages can be converted' }, { quoted: m });
    }

    await client.sendMessage(from, { text: '🔄 Converting sticker to image...' }, { quoted: m });

    try {
        const buffer = await m.quoted.download();
        const imageBuffer = await stickerConverter.convertStickerToImage(buffer);
        await client.sendMessage(from, {
            image: imageBuffer,
            caption: '> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴTᴇᴄʜＸ 🤍',
            mimetype: 'image/png'
        }, { quoted: m });
    } catch (error) {
        console.error("Conversion error:", error);
        await client.sendMessage(from, { text: '❌ Please try with a different sticker.' }, { quoted: m });
    }
});

// Media to MP3
cmd({
    pattern: 'tomp3',
    alias: ['toaudio', 'convert2audio', 'media2audio'],
    desc: 'Convert media to audio',
    category: 'media',
    filename: __filename
}, async (client, message, m, { from }) => {
    await client.sendMessage(m.key.remoteJid, { react: { text: '🎵', key: m.key } });

    if (!message.quoted) {
        return await client.sendMessage(from, { text: '*🔊 Please reply to a video/audio message*' }, { quoted: m });
    }
    if (!['videoMessage', 'audioMessage'].includes(message.quoted.mtype)) {
        return await client.sendMessage(from, { text: '❌ Only video/audio messages can be converted' }, { quoted: m });
    }
    if (message.quoted.seconds > 300) { // 5 minutes limit
        return await client.sendMessage(from, { text: '⏱️ Media too long (max 5 minutes)' }, { quoted: m });
    }

    await client.sendMessage(from, { text: '🔄 Converting to audio...' }, { quoted: m });

    try {
        const buffer = await message.quoted.download();
        const inputFormat = message.quoted.mtype === 'videoMessage' ? 'mp4' : 'm4a';
        const audioBuffer = await converter.toAudio(buffer, inputFormat);
        await client.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg'
        }, { quoted: m });
    } catch (error) {
        console.error("Audio conversion error:", error.message);
        await client.sendMessage(from, { text: '❌ Failed to process audio' }, { quoted: m });
    }
});


// Media to PTT (Voice Message)
cmd({
    pattern: 'toptt',
    desc: 'Convert media to voice message',
    category: 'media',
    filename: __filename
}, async (client, message, m, { from }) => {
    await client.sendMessage(m.key.remoteJid, { react: { text: '🎙️', key: m.key } });

    if (!message.quoted) {
        return await client.sendMessage(from, { text: '*🗣️ Please reply to a video/audio message*' }, { quoted: m });
    }
    if (!['videoMessage', 'audioMessage'].includes(message.quoted.mtype)) {
        return await client.sendMessage(from, { text: '❌ Only video/audio messages can be converted' }, { quoted: m });
    }
    if (message.quoted.seconds > 60) { // 1 minute limit
        return await client.sendMessage(from, { text: '⏱️ Media too long for voice (max 1 minute)' }, { quoted: m });
    }

    await client.sendMessage(from, { text: '🔄 Converting to voice message...' }, { quoted: m });

    try {
        const buffer = await message.quoted.download();
        const inputFormat = message.quoted.mtype === 'videoMessage' ? 'mp4' : 'm4a';
        const pttBuffer = await converter.toPTT(buffer, inputFormat);
        await client.sendMessage(from, {
            audio: pttBuffer,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: m });
    } catch (error) {
        console.error("PTT conversion error:", error.message);
        await client.sendMessage(from, { text: '❌ Failed to create voice message' }, { quoted: m });
    }
});
