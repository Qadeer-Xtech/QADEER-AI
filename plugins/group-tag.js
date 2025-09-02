// File: group-tag.js
const { cmd } = require('../command');

cmd({
    pattern: 'hidetag',
    alias: ['tag', 'h'],
    desc: 'To Tag all Members for Any Message/Media',
    category: 'group',
    use: '[message or reply to media]',
    filename: __filename
}, async (bot, msg, text, { from, q, isGroup, isPatron, participants, reply }) => {

    await bot.sendMessage(from, { react: { text: '🔊', key: msg.key } });

    try {
        if (!isGroup) return reply('❌ This command can only be used in groups.');
        if (!isPatron) return reply('*📛 This command is restricted to owners only.*');

        const mentions = { mentions: participants.map(p => p.id) };

        if (!q && !msg.quoted) {
            return reply('❌ Please provide a message or reply to a message to tag all members.');
        }

        // Handle replied messages
        if (msg.quoted) {
            const messageType = msg.quoted.mtype || '';
            const quotedMessageText = msg.quoted.text || '';

            // If it's a simple text message or unsupported type, just send the text
            if (messageType === 'extendedTextMessage') {
                return await bot.sendMessage(from, { text: quotedMessageText, ...mentions }, { quoted: msg });
            }
            
            // Handle different media types
            const supportedMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'];
            if (supportedMedia.includes(messageType)) {
                try {
                    const mediaBuffer = await msg.quoted.download?.();
                    if (!mediaBuffer) throw new Error("Failed to download media.");

                    let mediaMessage;
                    switch (messageType) {
                        case 'imageMessage':
                            mediaMessage = { image: mediaBuffer, caption: quotedMessageText || '📷 Image', ...mentions };
                            break;
                        case 'videoMessage':
                            mediaMessage = { video: mediaBuffer, caption: quotedMessageText || '🎥 Video', ...mentions };
                            break;
                        case 'audioMessage':
                            mediaMessage = { audio: mediaBuffer, mimetype: 'audio/mp4', ptt: msg.quoted.message?.audioMessage?.ptt || false, ...mentions };
                            break;
                        case 'stickerMessage':
                            mediaMessage = { sticker: mediaBuffer, ...mentions };
                            break;
                        case 'documentMessage':
                            mediaMessage = { document: mediaBuffer, mimetype: msg.quoted.message?.documentMessage?.mimetype, fileName: msg.quoted.message?.documentMessage?.fileName || 'file', ...mentions };
                            break;
                    }
                    if (mediaMessage) return await bot.sendMessage(from, mediaMessage, { quoted: msg });
                
                } catch (downloadError) {
                    console.error("Media download/send error:", downloadError);
                    // Fallback to text if media fails
                    return reply('❌ Failed to process the media. Sending as text instead.');
                }
            }
        }
        
        // Handle text provided directly with the command
        if (q) {
            await bot.sendMessage(from, { text: q, ...mentions }, { quoted: msg });
        }

    } catch (error) {
        console.log(error);
        reply('❌ *An Error Occurred !!*\n\n' + error.message);
    }
});
