const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');
const { ezra } = require('../fredi/ezra');
const traduire = require('../fredi/ezra');
const { downloadMediaMessage, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs-extra');
const axios = require('axios');
const { exec } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');
const { Catbox } = require('node-catbox');
const catbox = new Catbox();
const FormData = require('form-data');

async function uploadToCatbox(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error("Fichier non existant en recupering your url");
    }
    try {
        const url = await catbox.uploadFile({ path: filePath });
        if (url) {
            return url;
        } else {
            throw new Error("⭕Error uploading to Imgur :"); // Error uploading to Imgur
        }
    } catch (error) {
        throw new Error(String(error));
    }
}


// --- Command: sticker ---
// Image ya video se sticker banata hai.
ezra({
    nomCom: 'sticker',
    aliases: ['sticker'],
    categorie: 'General',
    reaction: '😻'
}, async (chatId, bot, utils) => {
    let { ms: message, mtype: messageType, arg: args, repondre: reply, nomAuteurMessage: authorName } = utils;
    
    const quotedMessageJson = JSON.stringify(message.contextInfo);
    const isQuotedImage = messageType === 'extendedTextMessage' && quotedMessageJson.includes('imageMessage');
    const isQuotedVideo = messageType === 'extendedTextMessage' && quotedMessageJson.includes('videoMessage');
    
    const tempFileName = "temp_sticker_" + Math.floor(Math.random() * 10000);
    const outputPath = `./${tempFileName}.webp`;

    try {
        let mediaMessage;
        let mediaType;

        if (messageType === 'imageMessage' || isQuotedImage) {
            mediaType = 'image';
            mediaMessage = isQuotedImage ? message.contextInfo.quotedMessage.imageMessage : message.imageMessage;
        } else if (messageType === 'videoMessage' || isQuotedVideo) {
            mediaType = 'video';
            mediaMessage = isQuotedVideo ? message.contextInfo.quotedMessage.videoMessage : message.videoMessage;
        } else {
            return reply("⭕Reply to an image or video to create a sticker please");
        }

        const stream = await downloadContentFromMessage(mediaMessage, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        if (mediaType === 'image') {
            const stickerType = args.includes('crop') || args.includes('c') ? StickerTypes.CROPPED : StickerTypes.DEFAULT;
            const sticker = new Sticker(buffer, {
                pack: '✧⁠QADEER-AI✧',
                author: authorName,
                type: stickerType,
                quality: 70
            });
            await sticker.toFile(outputPath);

        } else if (mediaType === 'video') {
            const inputPath = `./${tempFileName}.mp4`;
            await fs.promises.writeFile(inputPath, buffer);

            await new Promise((resolve, reject) => {
                ffmpeg(inputPath)
                    .outputOptions([
                        '-vf', 'fps=15,scale=512:512:force_original_aspect_ratio=decrease',
                        '-loop', '0',
                        '-an',
                        '-vsync', '0',
                        '-s', '512:512'
                    ])
                    .save(outputPath)
                    .on('end', async () => {
                        await fs.promises.unlink(inputPath);
                        resolve();
                    })
                    .on('error', (err) => {
                        reject(err);
                    });
            });
        }
        
        await bot.sendMessage(chatId, { sticker: await fs.promises.readFile(outputPath) }, { quoted: message });
        await fs.promises.unlink(outputPath);

    } catch (error) {
        reply(`😑Opps error: ${error.message}`);
    }
});


// --- Command: take ---
// Sticker ka pack aur author name tabdeel karta hai (Cropped).
ezra({
    nomCom: 'take',
    categorie: 'General',
    reaction: '✂️'
}, async (chatId, bot, utils) => {
    const { ms: message, msgRepondu: quotedMessage, arg: args, repondre: reply, nomAuteurMessage: authorName } = utils;

    if (!quotedMessage || !quotedMessage.stickerMessage) {
        return reply("⭕Reply to a sticker to use this command.");
    }
    
    const packName = args.length > 0 ? args.join(' ') : authorName;
    const mediaMsg = quotedMessage.stickerMessage;

    try {
        const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {});
        let sticker = new Sticker(buffer, {
            pack: packName,
            author: '✧⁠QADEER AI✧',
            type: StickerTypes.CROPPED,
            id: '12345',
            quality: 70,
            background: 'default'
        });

        const stickerBuffer = await sticker.toBuffer();
        bot.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: message });
    } catch (e) {
        reply("🚫Error while processing the sticker.");
    }
});


// --- Command: steal ---
// Sticker ka pack aur author name tabdeel karta hai (Full).
ezra({
    nomCom: 'steal',
    categorie: 'General',
    reaction: '💾'
}, async (chatId, bot, utils) => {
    const { ms: message, msgRepondu: quotedMessage, arg: args, repondre: reply, nomAuteurMessage: authorName } = utils;

    if (!quotedMessage || !quotedMessage.stickerMessage) {
        return reply("⭕Reply to a sticker to use this command.");
    }

    const packName = args.length > 0 ? args.join(' ') : authorName;
    const mediaMsg = quotedMessage.stickerMessage;

    try {
        const buffer = await downloadMediaMessage(mediaMsg, 'buffer', {});
        let sticker = new Sticker(buffer, {
            pack: authorName,
            author: packName,
            type: StickerTypes.DEFAULT,
            id: '12345',
            quality: 70,
            background: 'transparent'
        });

        const stickerBuffer = await sticker.toBuffer();
        bot.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: message });
    } catch (e) {
        reply("🚫Error while processing the sticker.");
    }
});


// --- Command: smeme ---
// Image par text likh kar meme sticker banata hai.
ezra({
    nomCom: 'smeme',
    categorie: 'General',
    reaction: '📝'
}, async (chatId, bot, utils) => {
    const { ms: message, msgRepondu: quotedMessage, arg: args, repondre: reply, nomAuteurMessage: authorName } = utils;

    if (!quotedMessage || !quotedMessage.imageMessage) {
        return reply("⁉️Please mention an image or sticker to create a meme.");
    }
    
    let text = args.join(' ');
    if (!text) {
        return reply("⁉️Please insert a text Message");
    }

    const mediaMsg = quotedMessage.imageMessage;

    try {
        const imagePath = await downloadMediaMessage(mediaMsg, 'file', {});
        
        // Upload to Imgur
        const formData = new FormData();
        formData.append('image', fs.createReadStream(imagePath));
        const headers = {
            'Authorization': 'Client-ID b40a1820d63cd4e',
            ...formData.getHeaders()
        };
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://api.imgur.com/3/image',
            headers: headers,
            data: formData
        };

        const response = await axios(config);
        const imgurLink = response.data.data.link;
        fs.unlinkSync(imagePath);

        // Generate meme and sticker
        const memeUrl = `https://i.memegen.net/s/custom/-/${encodeURIComponent(text)}.png?background=${imgurLink}`;
        const sticker = new Sticker(memeUrl, {
            pack: authorName,
            author: '@whiskeysockets',
            type: StickerTypes.DEFAULT,
            id: '12345',
            quality: 70,
            background: 'transparent'
        });

        const stickerBuffer = await sticker.toBuffer();
        bot.sendMessage(chatId, { sticker: stickerBuffer }, { quoted: message });

    } catch (error) {
        console.log("🚫Error while creating the sticker: ", error);
        reply("🚫An error occurred while creating the sticker.");
    }
});


// --- Command: toimg ---
// Sticker ko wapas image mein convert karta hai.
ezra({
    nomCom: 'toimg',
    categorie: 'General',
    reaction: '📷'
}, async (chatId, bot, utils) => {
    const { ms: message, msgRepondu: quotedMessage, repondre: reply } = utils;

    if (!quotedMessage) {
        return reply("⁉️mention a sticker please");
    }
    if (!quotedMessage.stickerMessage) {
        return reply("⁉️Uhhh mention a non-animated sticker please");
    }

    try {
        const inputPath = await downloadMediaMessage(quotedMessage.stickerMessage, 'file', {});
        const outputPath = `${inputPath}.png`;

        exec(`ffmpeg -i ${inputPath} ${outputPath}`, (error) => {
            fs.unlinkSync(inputPath);
            if (error) {
                bot.sendMessage(chatId, { text: "🚫Error while processing the media" }, { quoted: message });
                return;
            }
            let image = fs.readFileSync(outputPath);
            bot.sendMessage(chatId, { image: image }, { quoted: message });
            fs.unlinkSync(outputPath);
        });
    } catch (e) {
        reply("🚫/A non-animated sticker please");
    }
});


// --- Command: tr ---
// Reply kiye gaye message ko translate karta hai.
ezra({
    nomCom: 'tr',
    categorie: 'General',
    reaction: '💡'
}, async (chatId, bot, utils) => {
    const { msgRepondu: quotedMessage, repondre: reply, arg: args } = utils;

    if (quotedMessage) {
        try {
            if (!args || !args[0]) {
                return reply("⁉️Please mention a text Message (eg : trt en)");
            }
            let translatedText = await traduire(quotedMessage.conversation, { to: args[0] });
            reply(translatedText);
        } catch (e) {
            reply("🚫Error while processing your text");
        }
    } else {
        reply("💡This command only works with a text Message");
    }
});


// --- Command: url ---
// Reply kiye gaye image/video ko Catbox par upload karke link deta hai.
ezra({
    nomCom: 'url',
    categorie: 'Conversion',
    reaction: '🖇️'
}, async (chatId, bot, utils) => {
    const { msgRepondu: quotedMessage, repondre: reply } = utils;

    if (!quotedMessage) {
        return reply("⁉️mention a image or video");
    }

    let filePath;
    try {
        if (quotedMessage.videoMessage) {
            filePath = await downloadMediaMessage(quotedMessage.videoMessage, 'file', {});
        } else if (quotedMessage.imageMessage) {
            filePath = await downloadMediaMessage(quotedMessage.imageMessage, 'file', {});
        } else {
            return reply("⁉️mention an image or video");
        }

        const url = await uploadToCatbox(filePath);
        fs.unlinkSync(filePath);
        reply(url);

    } catch (error) {
        console.log("⭕Error uploading to Imgur :", error);
        reply("🚫Error while processing your request :");
    }
});
