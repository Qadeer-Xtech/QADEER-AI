// check-uptime.js

const { cmd } = require('../command');
const { runtime } = require('../lib/functions');
const config = require('../config');

cmd({
    pattern: 'uptime',
    alias: ['runtime', 'up'],
    desc: 'Show bot uptime with stylish formats',
    category: 'main',
    filename: __filename
}, async (sock, m, { from, reply }) => {
    try {
        // Send a thinking emoji reaction
        await sock.sendMessage(m.key.remoteJid, { react: { text: '⏱️', key: m.key } });

        // Get the process uptime and format it
        const uptimeString = runtime(process.uptime());
        
        // Construct the response message
        const responseText = `⌬ *PATRON SYSTEM ONLINE*\n│ *Uptime:* ${uptimeString}\n⎯⎯⎯⎯⎯⎯⎯⎯⎯\n\n> ⚙️ *PatronTechX AI Core* 🚹`;

        // Send the formatted uptime message with a custom context for styling
        await sock.sendMessage(from, {
            text: responseText,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 2,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363303045895814@newsletter',
                    newsletterName: 'ᴘᴀᴛʀᴏɴTᴇᴄʜＸ',
                    serverMessageId: 143
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error("Uptime Error:", error);
        reply(`❌ Error: ${error.message}`);
    }
});
