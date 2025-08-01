const config = require('../config');
const { cmd, commands } = require('../command');
const path = require('path');
const fs = require('fs');
const { runtime } = require('../lib/functions');
const axios = require('axios');

// Command definition
cmd({
    pattern: 'menu',
    alias: ['allmenu', '.menu2'],
    use: 'fullmenu',
    desc: 'Show all bot commands',
    category: 'menu',
    react: '📜',
    filename: __filename
}, async (bot, match, message, { from, reply }) => {
    try {
        // Path to the plugins directory
        const pluginsPath = path.join(__dirname, '../plugins');
        // Read all .js files from the plugins directory
        const pluginFiles = fs.readdirSync(pluginsPath).filter(file => file.endsWith('.js'));

        let commandCount = 0;
        let categoriesText = [];

        // Loop through each plugin file to extract command patterns
        for (const file of pluginFiles) {
            const filePath = path.join(pluginsPath, file);
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            
            // Extract all command patterns using a regular expression
            const patterns = [...fileContent.matchAll(/pattern:\s*["'`](.*?)["'`]/g)].map(match => match[1]);

            // If patterns are found, format them and add to the list
            if (patterns.length) {
                commandCount += patterns.length;
                const commandList = patterns.map(p => `★ *${p}*`).join('\n');
                categoriesText.push(`📁 *${file}*\n${commandList}`);
            }
        }

        // Construct the header of the menu message
        let menuHeader = `*╭────⬡ ${config.BOT_NAME} ⬡────⭓*\n` +
                         `*├▢ 🤖 Owner:* ${config.OWNER_NAME}\n` +
                         `*├▢ 📜 Commands:* ${commandCount}\n` +
                         `*├▢ ⏱️ Runtime:* ${runtime(process.uptime())}\n` +
                         `*├▢ 📡 Baileys:* Multi Device\n` +
                         `*├▢ ☁️ Platform:* Heroku\n` +
                         `*├▢ ⚙️ Mode:* ${config.MODE}\n` +
                         `*├▢ 🏷️ Version:* 5.0.0 ʙʀᴀɴᴅ\n` +
                         `*╰─────────────────⭓*\n\n`;

        // "Read More" trick for WhatsApp
        const readMore = String.fromCharCode(8206).repeat(4001);

        // Combine all parts of the menu
        const fullMenuText = menuHeader + readMore + categoriesText.join('\n\n') + `\n\n${config.DESCRIPTION}`;

        // Create a fake quoted message to look like an official WhatsApp message
        const quotedMessage = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast'
            },
            message: {
                contactMessage: {
                    displayName: 'WhatsApp Verified',
                    vcard: 'BEGIN:VCARD\nVERSION:3.0\nFN:WhatsApp Verified✓\nORG:Meta Verified;\nTEL;type=CELL;type=VOICE;waid=923070000000:+92 307 0000000\nEND:VCARD'
                }
            }
        };

        // Send the menu with an image and caption
        await bot.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || 'https://qu.ax/Pusls.jpg' },
            caption: fullMenuText,
            contextInfo: {
                mentionedJid: [message.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363345872435489@newsletter',
                    newsletterName: config.BOT_NAME,
                    serverMessageId: 143
                }
            }
        }, { quoted: quotedMessage });

    } catch (error) {
        // Log and reply with any errors
        console.log(error);
        reply('Error: ' + error);
    }
});
