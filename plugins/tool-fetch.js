// tool-fetch.js
const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
    pattern: 'fetch',
    alias: ['api'],
    desc: 'Fetch data from a provided URL or API',
    category: 'main',
    filename: __filename
}, async (client, message, m, { from, quoted, args, reply }) => {
    
    await client.sendMessage(m.key.remoteJid, { react: { text: '🔍', key: m.key } });

    try {
        const url = args.join(' ').trim();

        if (!url) {
            return reply('❌ Please provide a valid URL or query.');
        }
        if (!/^https?:\/\//.test(url)) {
            return reply('❌ URL must start with http:// or https://.');
        }

        const jsonData = await fetchJson(url);
        const formattedJson = JSON.stringify(jsonData, null, 2);

        await client.sendMessage(from, {
            text: `📊 *Fetched Data*:\n\`\`\`${formattedJson.slice(0, 800)}\`\`\``,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 2,
                isForwarded: true,
                forwardingSourceMessage: 'Your Data Request'
            }
        }, { quoted: message });

    } catch (error) {
        console.error('Error in fetch command:', error);
        reply(`❌ An error occurred:\n${error.message}`);
    }
});
