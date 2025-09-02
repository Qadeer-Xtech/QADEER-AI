// get-cmd.js
const { cmd, commands } = require('../command');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: 'getplugin',
    alias: ['get', 'source'],
    desc: 'Fetch the full source code of a command',
    category: 'owner',
    filename: __filename,
    use: '<command_name>'
}, async (sock, message, { from, args, reply }) => {

    await sock.sendMessage(from, { react: { text: '📜', key: message.key } });

    try {
        const authorizedUsers = ['923151105391@s.whatsapp.net', '923079749129@s.whatsapp.net'];
        if (!authorizedUsers.includes(message.sender)) {
            return reply('❌ You are not authorized to use this command!');
        }

        if (!args[0]) {
            return reply('❌ Please provide a command name. Example: `.get alive`');
        }

        const commandName = args[0].toLowerCase();
        const command = commands.find(c => c.pattern === commandName || (c.alias && c.alias.includes(commandName)));

        if (!command) {
            return reply('❌ Command not found!');
        }

        const commandPath = command.filename;
        let fileContent = fs.readFileSync(commandPath, 'utf-8');
        let truncatedContent = fileContent;

        if (fileContent.length > 4000) {
            truncatedContent = fileContent.substring(0, 4000) + '\n\n// Code too long, sending full file 📂';
        }
        
        const caption = '⬤───〔 *📜 Command Source* 〕───⬤\n```js\n' + truncatedContent + '\n```\n╰──────────⊷  \n⚡ Full file sent below 📂  \n𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽* 🤖';

        await sock.sendMessage(from, {
            image: { url: 'https://files.catbox.moe/e71nan.png' },
            caption: caption,
            contextInfo: {
                mentionedJid: [message.sender],
                forwardingScore: 2,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363345872435489@newsletter',
                    newsletterName: '𝚀𝙰𝙳𝙴𝙴𝚁_𝙺𝙷𝙰𝙽',
                    serverMessageId: 143
                }
            }
        }, { quoted: message });

        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const tempFileName = `temp-${commandName}-${Date.now()}.js`;
        const tempFilePath = path.join(tempDir, tempFileName);
        
        fs.writeFileSync(tempFilePath, fileContent);
        
        await sock.sendMessage(from, {
            document: fs.readFileSync(tempFilePath),
            mimetype: 'text/javascript',
            fileName: `${commandName}.js`
        }, { quoted: message });

    } catch (error) {
        console.error('Error in .get command:', error);
        reply('❌ Error: ' + error.message);
    }
});
