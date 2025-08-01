//================================================================================
//                                  DEPENDENCIES
//================================================================================
const config = require('../config');
const { cmd, commands } = require('../command'); // 'commands' ko import karein command count ke liye
const { format, runtime } = require('../lib/functions'); // 'format' RAM ke liye, 'runtime' uptime ke liye
const fs = require('fs-extra');
const os = require('os');
const moment = require('moment-timezone');

//================================================================================
//                                 COMMAND DEFINITION
//================================================================================
cmd({
    pattern: 'menu1',
    alias: ['newfullmenu', 'newmenu'],
    desc: 'Show all bot commands in a categorized menu.',
    category: 'menu',
    react: '✨',
    filename: __filename
}, 
async (bot, match, message, { from, reply }) => {
    try {
        //------------------------------------------------
        //         COMMAND CATEGORIZATION
        //------------------------------------------------
        const coms = {};
        // 'commands' array (jo command.js se import hua) ko use karein
        commands.map(async (com) => {
            if (com.pattern === 'menu' || com.dontshow) return; // Menu command ko list mein show na karein
            if (!coms[com.category]) {
                coms[com.category] = [];
            }
            coms[com.category].push(com.pattern);
        });

        //------------------------------------------------
        //          DATA & INFO PREPARATION
        //------------------------------------------------
        const ramUsage = `${format(os.totalmem() - os.freemem())} / ${format(os.totalmem())}`;
        const commandCount = commands.length;
        
        //------------------------------------------------
        //            BUILDING THE MENU MESSAGE
        //------------------------------------------------
        
        // --- Header Section (Aap ke style ke mutabiq) ---
        let menuHeader = `*╭────⬡ ${config.BOT_NAME} ⬡────⭓*\n` +
                         `*├▢ 🤖 Owner:* ${config.OWNER_NAME}\n` +
                         `*├▢ 📜 Commands:* ${commandCount}\n` +
                         `*├▢ ⏱️ Runtime:* ${runtime(process.uptime())}\n` +
                         `*├▢ 🐏 RAM Usage:* ${ramUsage}\n` +
                         `*├▢ ⚙️ Mode:* ${config.MODE}\n` +
                         `*╰─────────────────⭓*\n\n`;

        // "Read More" trick
        const readMore = String.fromCharCode(8206).repeat(4001);

        // --- Commands List Section
        let menuBody = `*╭─「 COMMAND LIST 」* \n`;
        const categoryStyles = {
            general: { icon: "🌟" },
            group: { icon: "👥" },
            downloader: { icon: "📥" },
            fun: { icon: "🎭" },
            search: { icon: "🔍" },
            tools: { icon: "🛠️" },
            owner: { icon: "🛡️" },
        };

        for (const cat in coms) {
            const style = categoryStyles[cat] || { icon: "✨" };
            menuBody += `*│*\n*├─ ${style.icon} _${cat.charAt(0).toUpperCase() + cat.slice(1)}_\n`;
            coms[cat].forEach((cmdName) => {
                menuBody += `*│* ${config.PREFIX}${cmdName}\n`;
            });
        }
        menuBody += `*╰───────────⭓*\n\n`;


        // Combine all parts
        const fullMenuText = menuHeader + readMore + menuBody + `${config.DESCRIPTION}`;
        
        //------------------------------------------------
        //          PREPARING TO SEND MESSAGE
        //------------------------------------------------
        
        // Developer mention
        const mentionedJids = [
            message.sender,
            ...config.MODS.map(mod => `${mod}@s.whatsapp.net`) // MODS from config
        ];
        
        // Fake quoted message (Aap ke style ke mutabiq)
        const quotedMessage = {
            key: {
                fromMe: false,
                participant: '0@s.whatsapp.net',
                remoteJid: 'status@broadcast'
            },
            message: {
                contactMessage: {
                    displayName: `${config.OWNER_NAME}`, // Owner ka naam show karega
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${config.OWNER_NAME}\nORG:;\nTEL;type=CELL;type=VOICE;waid=${config.OWNER_NUMBER}:+${config.OWNER_NUMBER}\nEND:VCARD`
                }
            }
        };

        // Context Info (Aap ke style ke mutabiq)
        const contextInfo = {
            mentionedJid: mentionedJids,
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363345872435489@newsletter',
                newsletterName: `ʙᴏᴛ ᴘᴏᴡᴇʀᴇᴅ ʙʏ ${config.OWNER_NAME}`,
                serverMessageId: 143
            }
        };

        //------------------------------------------------
        //              SENDING THE MENU
        //------------------------------------------------
        await bot.sendMessage(from, {
            image: { url: config.MENU_IMAGE_URL || 'https://qu.ax/Pusls.jpg' },
            caption: fullMenuText,
            contextInfo: contextInfo
        }, { quoted: quotedMessage });
        
        //------------------------------------------------
        //      SENDING RANDOM AUDIO NOTE
        //------------------------------------------------
        try {
            const audioFolder = require('path').join(__dirname, '../Qadeer/'); // Folder ka path
            if (fs.existsSync(audioFolder)) {
                const audioFiles = fs.readdirSync(audioFolder).filter(f => f.endsWith(".mp3"));
                if (audioFiles.length > 0) {
                    const randomAudio = audioFiles[Math.floor(Math.random() * audioFiles.length)];
                    const audioPath = require('path').join(audioFolder, randomAudio);
                    await bot.sendMessage(from, {
                        audio: { url: audioPath },
                        mimetype: "audio/mpeg",
                        ptt: true,
                    }, { quoted: message });
                }
            }
        } catch (audioError) {
            console.log("Could not send random audio:", audioError);
        }

    } catch (error) {
        console.log(error);
        reply('An error occurred while building the menu: ' + error.message);
    }
});
