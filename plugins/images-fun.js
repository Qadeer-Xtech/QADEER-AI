// images-fun.js
const config = require('../config');
const axios = require('axios');
const {
    cmd
} = require('../command');
const {
    getBuffer
} = require('../lib/functions');
const fs =require('fs');

const errorMessage = "I can't find this anime.";
const footer = "> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖*";


// Loli images
cmd({
    pattern: 'garl',
    alias: ['imgloli'],
    desc: 'Download anime loli images.',
    category: 'fun',
    filename: __filename
}, async (bot, message, client, { from, reply }) => {
    await bot.sendMessage(message.key.remoteJid, { react: { text: '😎', key: message.key } });
    try {
        let response = await axios.get('https://api.lolicon.app/setu/v2?num=1&r18=0&tag=lolicon');
        let caption = `😎 Random Garl image\n\n${footer}`;
        await bot.sendMessage(from, { image: { url: response.data.data[0].urls.original }, caption: caption }, { quoted: message });
    } catch (e) {
        reply(errorMessage);
        console.log(e);
    }
});

// Waifu images
cmd({
    pattern: 'waifu',
    alias: ['imgwaifu'],
    desc: 'Download anime waifu images.',
    category: 'fun',
    filename: __filename
}, async (bot, message, client, { from, reply }) => {
    await bot.sendMessage(message.key.remoteJid, { react: { text: '💫', key: message.key } });
    try {
        let response = await axios.get('https://api.waifu.pics/nsfw/waifu');
        let caption = `🤖 Random Waifu image\n\n${footer}`;
        await bot.sendMessage(from, { image: { url: response.data.url }, caption: caption }, { quoted: message });
    } catch (e) {
        reply(errorMessage);
        console.log(e);
    }
});

// Neko images (NSFW)
cmd({
    pattern: 'neko',
    alias: ['imgneko'],
    desc: 'Download anime neko images.',
    category: 'fun',
    filename: __filename
}, async (bot, message, client, { from, reply }) => {
    await bot.sendMessage(message.key.remoteJid, { react: { text: '💫', key: message.key } });
    try {
        let response = await axios.get('https://api.waifu.pics/nsfw/neko');
        let caption = `🤖 Random neko image\n\n${footer}`;
        await bot.sendMessage(from, { image: { url: response.data.url }, caption: caption }, { quoted: message });
    } catch (e) {
        reply(errorMessage);
        console.log(e);
    }
});

// Megumin images
cmd({
    pattern: 'megumin',
    alias: ['imgmegumin'],
    desc: 'Download anime megumin images.',
    category: 'fun',
    filename: __filename
}, async (bot, message, client, { from, reply }) => {
    await bot.sendMessage(message.key.remoteJid, { react: { text: '💕', key: message.key } });
    try {
        let response = await axios.get('https://api.waifu.pics/sfw/megumin');
        let caption = `❤️‍🔥Random megumin image\n\n${footer}`;
        await bot.sendMessage(from, { image: { url: response.data.url }, caption: caption }, { quoted: message });
    } catch (e) {
        reply(errorMessage);
        console.log(e);
    }
});

// Maid images
cmd({
    pattern: 'maid',
    alias: ['imgmaid'],
    desc: 'Download anime maid images.',
    category: 'fun',
    filename: __filename
}, async (bot, message, client, { from, reply }) => {
    await bot.sendMessage(message.key.remoteJid, { react: { text: '💫', key: message.key } });
    try {
        let response = await axios.get('https://api.waifu.im/search/?included_tags=maid');
        let caption = `😎 Random maid image\n\n${footer}`;
        await bot.sendMessage(from, { image: { url: response.data.images[0].url }, caption: caption }, { quoted: message });
    } catch (e) {
        reply(errorMessage);
        console.log(e);
    }
});

// Awoo images
cmd({
    pattern: 'awoo',
    alias: ['imgawoo'],
    desc: 'Download anime awoo images.',
    category: 'fun',
    filename: __filename
}, async (bot, message, client, { from, reply }) => {
    await bot.sendMessage(message.key.remoteJid, { react: { text: '😎', key: message.key } });
    try {
        let response = await axios.get('https://api.waifu.pics/sfw/awoo');
        let caption = `😎 Random awoo image\n\n${footer}`;
        await bot.sendMessage(from, { image: { url: response.data.url }, caption: caption }, { quoted: message });
    } catch (e) {
        reply(errorMessage);
        console.log(e);
    }
});

// Dog image
cmd({
    pattern: 'dog',
    desc: 'Fetch a random dog image.',
    category: 'fun',
    filename: __filename
}, async (bot, message, client, { from, reply }) => {
    await bot.sendMessage(message.key.remoteJid, { react: { text: '🐶', key: message.key } });
    try {
        const response = await axios.get('https://dog.ceo/api/breeds/image/random');
        const caption = `> *© Powered By QADEER-AI>*`;
        await bot.sendMessage(from, { image: { url: response.data.message }, caption: caption }, { quoted: message });
    } catch (error) {
        console.log(error);
        reply(`error fetching dog image: ${error.message}`);
    }
});

// --- Generic Anime Girl Image Commands ---
const animeGirlCaption1 = `*ANIME GIRL IMAGE* 🥳\n\n\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸* 🤖`;
const animeGirlCaption2 = `ANIME GIRL IMAGE 👾\n\n\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖*`;
const animeApiUrl = 'https://api.waifu.pics/nsfw/waifu';

async function sendAnimeGirlImage(bot, message, from, reply, caption, react) {
    await bot.sendMessage(message.key.remoteJid, { react: { text: react, key: message.key } });
    try {
        const response = await axios.get(animeApiUrl);
        await bot.sendMessage(from, { image: { url: response.data.url }, caption: caption }, { quoted: message });
    } catch (error) {
        console.log(error);
        reply(`*Error Fetching Anime Girl image*: ${error.message}`);
    }
}

cmd({ pattern: 'animegirl', desc: 'Fetch a random anime girl image.', category: 'fun', filename: __filename }, 
    (b, m, c, { from, reply }) => sendAnimeGirlImage(b, m, from, reply, animeGirlCaption1, '🧚🏻'));

cmd({ pattern: 'animegirl1', desc: 'Fetch a random anime girl image.', category: 'fun', filename: __filename }, 
    (b, m, c, { from, reply }) => sendAnimeGirlImage(b, m, from, reply, animeGirlCaption2, '🧚🏻'));

cmd({ pattern: 'animegirl2', desc: 'Fetch a random anime girl image.', category: 'fun', filename: __filename }, 
    (b, m, c, { from, reply }) => sendAnimeGirlImage(b, m, from, reply, animeGirlCaption2, '🧚🏻'));
    
cmd({ pattern: 'animegirl3', desc: 'Fetch a random anime girl image.', category: 'fun', filename: __filename }, 
    (b, m, c, { from, reply }) => sendAnimeGirlImage(b, m, from, reply, animeGirlCaption2, '🧚🏻'));

cmd({ pattern: 'animegirl4', desc: 'Fetch a random anime girl image.', category: 'fun', filename: __filename }, 
    (b, m, c, { from, reply }) => sendAnimeGirlImage(b, m, from, reply, animeGirlCaption2, '🧚🏻'));

cmd({ pattern: 'animegirl5', desc: 'Fetch a random anime girl image.', category: 'fun', filename: __filename }, 
    (b, m, c, { from, reply }) => sendAnimeGirlImage(b, m, from, reply, animeGirlCaption2, '🧚🏻'));


// --- Multi-Image Anime Commands ---
const multiImgCaption = `> QADEER-AI ANIME IMGS*`;
const otherCategory = 'other';

async function sendMultiImages(bot, message, from, reply, imageUrls) {
    try {
        for (const url of imageUrls) {
            await bot.sendMessage(from, { image: { url }, caption: multiImgCaption }, { quoted: message });
        }
    } catch (e) {
        console.log(e);
        reply('' + e);
    }
}

cmd({ pattern: 'anime', desc: 'anime the bot', category: 'main', filename: __filename }, 
    async (b, m, c, { from, reply }) => {
        await b.sendMessage(m.key.remoteJid, { react: { text: '⛱️', key: m.key } });
        const urls = [
            'https://telegra.ph/file/b26f27aa5daaada031b90.jpg', 
            'https://telegra.ph/file/51b44e4b086667361061b.jpg',
            'https://telegra.ph/file/7d165d73f914985542537.jpg', 
            'https://telegra.ph/file/3d9732d2657d2d72dc102.jpg',
            'https://telegra.ph/file/8daf7e432a646f3ebe7eb.jpg',
            'https://telegra.ph/file/7514b18ea89da924e7496.jpg',
            'https://telegra.ph/file/ce9cb5acd2cec7693d76b.jpg'
        ];
        sendMultiImages(b, m, from, reply, urls);
    });
    
cmd({ pattern: 'anime1', desc: 'Animal image.', category: 'other', filename: __filename }, 
    async (b, m, c, { from, reply }) => {
        await b.sendMessage(m.key.remoteJid, { react: { text: '🧚‍♀️', key: m.key } });
        const urls = [
            'https://i.waifu.pics/aD7t0Bc.jpg',
            'https://i.waifu.pics/MjtH3Ha.jpg',
            'https://i.waifu.pics/QQW7VKy.jpg',
            'https://i.waifu.pics/7Apu5C9.jpg',
            'https://i.waifu.pics/4lyqRvd.jpg'
        ];
        sendMultiImages(b, m, from, reply, urls);
    });

cmd({ pattern: 'anime2', desc: 'Animal image.', category: otherCategory, filename: __filename }, 
    async (b, m, c, { from, reply }) => {
        await b.sendMessage(m.key.remoteJid, { react: { text: '🧚‍♀️', key: m.key } });
        const urls = [
            'https://i.waifu.pics/0r1Bn88.jpg',
            'https://i.waifu.pics/~p5W9~k.png',
            'https://i.waifu.pics/0hx-3AP.png',
            'https://i.waifu.pics/2Xdpuov.png',
            'https://i.waifu.pics/3x~ovC6.jpg'
        ];
        sendMultiImages(b, m, from, reply, urls);
    });

cmd({ pattern: 'anime3', desc: 'Animal image.', category: otherCategory, filename: __filename }, 
    async (b, m, c, { from, reply }) => {
        await b.sendMessage(m.key.remoteJid, { react: { text: '🧚‍♀️', key: m.key } });
        const urls = [
            'https://i.waifu.pics/OTRfON6.jpg',
            'https://i.waifu.pics/P6X-ph6.jpg',
            'https://i.waifu.pics/94LH-aU.jpg',
            'https://i.waifu.pics/7Apu5C9.jpg',
            'https://i.waifu.pics/gnpc_Lr.jpeg'
        ];
        sendMultiImages(b, m, from, reply, urls);
    });

cmd({ pattern: 'anime4', desc: 'Animal image.', category: otherCategory, filename: __filename }, 
    async (b, m, c, { from, reply }) => {
        await b.sendMessage(m.key.remoteJid, { react: { text: '🧚‍♀️', key: m.key } });
        const urls = [
            'https://i.waifu.pics/aGgUm80.jpg',
            'https://i.waifu.pics/i~RQhRD.png',
            'https://i.waifu.pics/brv-GJu.jpg',
            'https://i.waifu.pics/V8hvqfK.jpg',
            'https://i.waifu.pics/lMiXE7j.png'
        ];
        sendMultiImages(b, m, from, reply, urls);
    });

cmd({ pattern: 'anime5', desc: 'Animal image.', category: otherCategory, filename: __filename }, 
    async (b, m, c, { from, reply }) => {
        await b.sendMessage(m.key.remoteJid, { react: { text: '🧚‍♀️', key: m.key } });
        const urls = [
            'https://i.waifu.pics/FWE8ggD.png',
            'https://i.waifu.pics/-ABlAvr.jpg',
            'https://i.waifu.pics/HNEg0-Q.png',
            'https://i.waifu.pics/q054x0_.png',
            'https://i.waifu.pics/5At1P4A.jpg'
        ];
        sendMultiImages(b, m, from, reply, urls);
    });
