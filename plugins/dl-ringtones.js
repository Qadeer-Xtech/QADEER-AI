// dl-ringtones.js

const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: 'ringtone',
    alias: ['ringtones', 'ring'],
    desc: 'Get a random ringtone from the API.',
    category: 'fun',
    filename: __filename,
    use: '<query>'
}, async (sock, m, message, { from, reply, args }) => {
    try {
        // Send a thinking emoji reaction
        await sock.sendMessage(message.key.remoteJid, { react: { text: '🎵', key: message.key } });

        const query = args.join(' ');
        if (!query) {
            return reply('Please provide a search query! Example: .ringtone Suna');
        }

        const { data: apiResponse } = await axios.get(`https://www.dark-yasiya-api.site/download/ringtone?text=${encodeURIComponent(query)}`);

        // Validate the API response
        if (!apiResponse.status || !apiResponse.result || apiResponse.result.length === 0) {
            return reply('No ringtones found for your query. Please try a different keyword.');
        }

        // Pick a random ringtone from the results
        const randomRingtone = apiResponse.result[Math.floor(Math.random() * apiResponse.result.length)];

        // Send the ringtone as an audio file
        await sock.sendMessage(from, {
            audio: { url: randomRingtone.dl_link },
            mimetype: 'audio/mpeg',
            fileName: `${randomRingtone.title}.mp3`
        }, { quoted: m });

    } catch (error) {
        console.error("Error in ringtone command:", error);
        reply('Sorry, something went wrong while fetching the ringtone. Please try again later.');
    }
});
