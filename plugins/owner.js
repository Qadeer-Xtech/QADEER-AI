const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: "owner",
    react: "👑", // Emoji changed to be more relevant
    desc: "Get owner's contact details.",
    category: "main",
    filename: __filename
}, 
async (conn, m, { from }) => { // Standard parameters
    try {
        const ownerNumber = config.OWNER_NUMBER;
        const ownerName = config.OWNER_NAME;

        // vCard (Contact Card) banane ka tareeqa
        const vcard = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      `FN:${ownerName}\n` + // Using owner name from config
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}\n` + // Using owner number from config
                      'END:VCARD';

        // vCard (Contact Card) bhejein
        await conn.sendMessage(from, {
            contacts: {
                displayName: ownerName,
                contacts: [{ vcard }]
            }
        }, { quoted: m }); // Quoted message for context

        // Owner ki details wala message bhejein
        await conn.sendMessage(from, {
            image: { url: 'https://telegra.ph/file/07ce3c59a354e60f7850a.jpg' }, // A more stable image link
            caption: `*Here are the details of my owner:*\n\n` +
                     `*Name:* ${ownerName}\n` +
                     `*Number:* Wa.me/${ownerNumber}\n\n` +
                     `_Feel free to contact for any queries or collaborations._`,
            contextInfo: {
                mentionedJid: [`${ownerNumber}@s.whatsapp.net`], 
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: { // For a better look
                    title: `Owner: ${ownerName}`,
                    body: "Official Bot Contact",
                    thumbnail: { url: 'https://telegra.ph/file/07ce3c59a354e60f7850a.jpg' },
                    sourceUrl: `https://wa.me/${ownerNumber}`,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }          
            }
        }, { quoted: m });
        
    } catch (error) {
        console.error("Owner Command Error:", error);
        // FIX: reply ko vv2 model par laya gaya
        const errorText = "An error occurred while fetching owner details.";
        await conn.sendMessage(from, { text: errorText }, { quoted: m });
    }
});
