// tool-wstalk.js
const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: 'wstalk',
    alias: ['channelstalk', 'chinfo'],
    desc: 'Get WhatsApp channel information',
    category: 'utility',
    filename: __filename,
    use: '.wstalk <WhatsApp channel URL>'
}, async (client, message, m, { from, reply, args }) => {
    
    // React to the message to indicate processing
    await client.sendMessage(m.key.remoteJid, {
        react: {
            text: '🔍',
            key: m.key
        }
    });

    try {
        // Check if a URL is provided
        if (!args) {
            return reply('❌ Please provide a WhatsApp channel URL\nExample: .wstalk https://whatsapp.com/channel/0029VajWxSZ96H4SyQLurV1H');
        }

        // Extract channel ID from the URL
        const channelId = args.match(/channel\/([0-9A-Za-z]+)/i)?.[1];
        if (!channelId) {
            return reply('❌ Invalid WhatsApp channel URL');
        }

        // Fetch channel data from the API
        const apiUrl = `https://itzpire.com/stalk/whatsapp-channel?url=https://whatsapp.com/channel/${channelId}`;
        const response = await axios.get(apiUrl);
        const channelData = response.data.data;

        // Format the response message
        let responseText = `╭━━〔 *CHANNEL INFO* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• *📢 Title*: ${channelData.title}
┃◈┃• *👥 Followers*: ${channelData.followers}
┃◈┃• *📝 Description*: ${channelData.description.replace(/\n/g, '\n┃◈┃• ')}
┃◈└───────────┈⊷
╰──────────────┈⊷
> © 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽`;

        // Send the channel info with its profile picture
        await client.sendMessage(from, {
            image: { url: channelData.img },
            caption: responseText,
            contextInfo: {
                forwardingScore: 2,
                isForwarded: true
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in wstalk command:', error);
        const errorMessage = error.response?.data?.message || error.message;
        reply(`❌ Error: ${errorMessage}`);
    }
});
