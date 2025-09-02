// fun-etc.js

const axios = require('axios');
const { cmd } = require('../command');
const { fetchGif, gifToVideo } = require('../lib/fetchGif');

cmd({
    pattern: 'marriage',
    alias: ['shadi', 'mirage', 'wedding'],
    desc: 'Randomly pairs two users for marriage with a wedding GIF',
    category: 'fun',
    filename: __filename
}, async (sock, m, message, { isGroup, groupMetadata, reply, sender }) => {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '💍', key: m.key } });
    try {
        if (!isGroup) {
            return reply('❌ This command can only be used in groups!');
        }

        const participants = groupMetadata.participants.map(p => p.id);
        
        // Filter out the sender and the bot itself
        const potentialPartners = participants.filter(
            id => id !== sender && !id.includes(sock.user.id.split('@')[0])
        );

        if (potentialPartners.length < 1) {
            return reply('❌ Not enough participants to perform a marriage!');
        }

        // Select a random partner
        const partnerIndex = Math.floor(Math.random() * potentialPartners.length);
        const partner = potentialPartners[partnerIndex];
        
        const gifApiUrl = 'https://api.waifu.pics/sfw/hug';
        let gifResponse = await axios.get(gifApiUrl);
        let gifUrl = gifResponse.data.url;

        // Fetch and convert the GIF to a video
        let gifBuffer = await fetchGif(gifUrl);
        let videoBuffer = await gifToVideo(gifBuffer);

        const marriageMessage = `💍 *Marriage!* 💒\n\n👰 @${sender.split('@')[0]} + 🤵 @${partner.split('@')[0]}\n\nMay you both live happily ever after! 💖`;
        
        await sock.sendMessage(m.chat, {
            video: videoBuffer,
            caption: marriageMessage,
            gifPlayback: true,
            mentions: [sender, partner]
        }, { quoted: m });

    } catch (error) {
        console.error('❌ *Error in .marige command:*', error);
        reply(`❌ Error in .marige command:\n\`\`\`${error.message}\`\`\``);
    }
});
