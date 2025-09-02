const { cmd } = require('../command');

cmd({
    pattern: 'vv2',
    alias: ['wah', 'ohh', 'viewonce', 'nice', 'ok'],
    desc: 'Owner Only - retrieve quoted message back to user',
    category: 'owner',
    filename: __filename
}, async (sock, m, store, { from, isTofan }) => {
    try {
        // owner
        if (!isTofan) return;

        // Check if the user is replying to a message
        if (!store.quoted) {
            return await sock.sendMessage(from, { text: '*• Please reply to a view once message!*' }, { quoted: m });
        }

        // Attempt to download the media from the quoted "view once" message
        const mediaBuffer = await store.quoted.download().catch(() => null);

        if (!mediaBuffer || mediaBuffer.length === 0) {
            return await sock.sendMessage(from, { text: '• Unable to retrieve media. It might have expired or wasn\'t accessible.' }, { quoted: m });
        }

        const messageType = store.quoted.mtype;
        const quotedOptions = { quoted: m };
        let messagePayload = {};

        switch (messageType) {
            case 'imageMessage':
                messagePayload = {
                    image: mediaBuffer,
                    caption: store.quoted.msg || '',
                    mimetype: store.quoted.mimetype || 'image/jpeg'
                };
                break;

            case 'videoMessage':
                messagePayload = {
                    video: mediaBuffer,
                    caption: store.quoted.msg || '',
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
                // If the message type is not supported
                return await sock.sendMessage(from, { text: '• Only image, video, and audio messages are supported.' }, { quoted: m });
        }

        // Send the retrieved media to the user who sent the command
        await sock.sendMessage(m.sender, messagePayload, quotedOptions);

    } catch (error) {
        console.error('vv2 Error:', error);
        await sock.sendMessage(from, { text: '• Error fetching vv message:\n' + error.message }, { quoted: m });
    }
});
