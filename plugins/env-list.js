// env-list.js

const config = require('../config');
const { cmd } = require('../command');
const axios = require('axios');

/**
 * Checks if a configuration value is set to 'true'.
 * @param {string|boolean} value - The configuration value.
 * @returns {boolean} True if the value is 'true', false otherwise.
 */
function isEnabled(value) {
    return value && value.toString().toLowerCase() === 'true';
}

cmd({
    pattern: 'settings',
    alias: ['setting', 'allvar'],
    desc: 'Displays the bot\'s settings.',
    category: 'menu',
    filename: __filename
}, async (sock, m, message, { from, reply }) => {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '⤵️', key: m.key } });
    try {
        let settingsText = 
            '╭━━〔 *QADEER-AI* 〕━━━┈⊷\n' +
            '┃▸╭───────────\n' +
            '┃▸┃๏ *ENV SETTINGS 🗿*\n' +
            '┃▸└───────────···๏\n' +
            '┃▸┃๏ *Check settingmenu for commands to change them*\n' +
            '╰────────────────┈⊷\n' +
            '╭━━〔 *Enabled/Disabled* 〕━━┈⊷\n' +
            `┇๏ *Status View:* ${isEnabled(config.AUTO_STATUS_SEEN) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Status Reply:* ${isEnabled(config.AUTO_STATUS_REPLY) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Auto React:* ${isEnabled(config.AUTO_STATUS_REACT) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Auto Reply:* ${isEnabled(config.AUTO_REPLY) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Auto Sticker:* ${isEnabled(config.AUTO_STICKER) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Auto Voice:* ${isEnabled(config.AUTO_VOICE) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Custom Reacts:* ${isEnabled(config.CUSTOM_REACT) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Auto React:* ${isEnabled(config.AUTO_REACT) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Anti-Link:* ${isEnabled(config.ANTI_LINK) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Anti-Bad Words:* ${isEnabled(config.ANTI_BAD) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Anti Call:* ${isEnabled(config.ANTI_CALL) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Auto Typing:* ${isEnabled(config.AUTO_TYPING) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Auto Recording:* ${isEnabled(config.AUTO_RECORDING) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Always Online:* ${isEnabled(config.ALWAYS_ONLINE) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Public Mode:* ${isEnabled(config.PUBLIC_MODE) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            `┇๏ *Read Message:* ${isEnabled(config.READ_MESSAGE) ? 'Enabled ✅' : 'Disabled ❌'}\n` +
            '╭━━〔 *Custom Settings* 〕━━┈⊷\n' +
            `┇๏ *Sticker Name:* ${config.STICKER_NAME || 'Not Set ❌'}\n` +
            `┇๏ *Custom React:* ${config.CUSTOM_REACT || 'Not Set ❌'}\n` +
            `┇๏ *Custom React Emojis:* ${config.CUSTOM_REACT_EMOJIS || 'Not Set ❌'}\n` +
            `┇๏ *Owner Number:* ${config.OWNER_NUMBER || 'Not Set ❌'}\n` +
            `┇๏ *Owner Name:* ${config.OWNER_NAME || 'Not Set ❌'}\n` +
            `┇๏ *Antidel Path:* ${config.ANTI_DEL_PATH || 'Not Set ❌'}\n` +
            '╰━━━━━━━━━━━━──┈⊷\n' +
            '> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽* 🤖';
        
        // Send the settings with an image and a custom context
        await sock.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/e71nan.png' },
            caption: settingsText,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 2,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363345872435489@newsletter',
                    newsletterName: '𝚀𝙰𝙳𝙴𝙴𝚁_𝙺𝙷𝙰𝙽',
                    serverMessageId: 143
                }
            }
        }, { quoted: m });
        
        // Send a voice note
        await sock.sendMessage(from, {
            audio: { url: 'https://github.com/Qadeer-Xtech/TOFAN-DATA/raw/refs/heads/main/autovoice/lost-astro.mp3' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: m });

    } catch (error) {
        console.log(error);
        reply(`Error: ${error.message}`);
    }
});
