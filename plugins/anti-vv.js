const { cmd } = require('../command');

cmd({
    pattern: 'vv',
    alias: ['viewonce', 'retrive'],
    desc: 'Owner Only - retrieve quoted message back to user',
    category: 'owner',
    filename: __filename
}, async (sock, m, store, { from, isTofan }) => {
    
    await sock.sendMessage(m.key.remoteJid, { react: { text: '🐳', key: m.key } });

    try {
        if (!isTofan) {
            return await sock.sendMessage(from, { text: '*📛 This is an owner command.*' }, { quoted: m });
        }

        if (!store.quoted) {
            return await sock.sendMessage(from, { text: '*🍁 Please reply to a view once message!*' }, { quoted: m });
        }

        const mediaBuffer = await store.quoted.download();
        const messageType = store.quoted.mtype;
        const options = { quoted: m };
        const footer = '\n\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽 🚹*';
        let messagePayload = {};

        switch (messageType) {
            case 'imageMessage':
                messagePayload = {
                    image: mediaBuffer,
                    caption: (store.quoted.text || '') + footer,
                    mimetype: store.quoted.mimetype || 'image/jpeg'
                };
                break;

            case 'videoMessage':
                messagePayload = {
                    video: mediaBuffer,
                    caption: (store.quoted.text || '') + footer,
                    mimetype: store.quoted.mimetype || 'video/mp4'
                };
                break;

            case 'audioMessage':
                messagePayload = {
                    audio: mediaBuffer,
                    mimetype: 'audio/mp4',
                    ptt: store.quoted.ptt || false
                };
                break;

            default:
                return await sock.sendMessage(from, { text: '❌ Only image, video, and audio messages are supported' }, { quoted: m });
        }

        await sock.sendMessage(from, messagePayload, options);

    } catch (error) {
        console.error('vv Error:', error);
        await sock.sendMessage(from, { text: '❌ Error fetching vv message:\n' + error.message }, { quoted: m });
    }
});
