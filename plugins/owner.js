const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: 'owner',
    desc: 'Get owner number',
    category: 'main',
    filename: __filename
}, async (bot, message, context, { from }) => {

    // React to the command message
    await bot.sendMessage(context.key.remoteJid, {
        react: {
            text: '✅',
            key: context.key
        }
    });

    try {
        const ownerNumber = config.OWNER_NUMBER;
        const ownerName = config.OWNER_NAME;

        // Create a VCard (Virtual Contact Card)
        const vcard = 'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            'FN:' + ownerName + '\n' +
            'TEL;type=CELL;type=VOICE;waid=' + ownerNumber.replace('+', '') + ':' + ownerNumber + '\n' +
            'END:VCARD';

        // Send the VCard
        await bot.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        });

        // Send an image with owner details as caption
        await bot.sendMessage(from, {
            image: { url: 'https://qu.ax/Pusls.jpg' },
            caption: `╭━━〔 *QADEER-AI* 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• *Here is the owner details*
┃◈┃• *Name* - ${ownerName}
┃◈┃• *Number* ${ownerNumber}
┃◈┃• *Version*: 4.0.0 Global
┃◈└───────────┈⊷
╰──────────────┈⊷
> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽* 🤖`,
            contextInfo: {
                mentionedJid: [ownerNumber.replace('+', '') + '@s.whatsapp.net'],
                forwardingScore: 2,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363345872435489@newsletter',
                    newsletterName: '𝚀𝙰𝙳𝙴𝙴𝚁_𝙺𝙷𝙰𝙽',
                    serverMessageId: 143
                }
            }
        }, { quoted: message });

        // Send an audio file
        await bot.sendMessage(from, {
            audio: { url: 'https://github.com/Qadeer-Xtech/TOFAN-DATA/raw/refs/heads/main/autovoice/lost-astro.mp3' },
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: message });

    } catch (error) {
        console.error(error);
        reply('An error occurred: ' + error.message);
    }
});
