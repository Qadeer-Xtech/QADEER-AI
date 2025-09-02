const { getMessage } = require('../data/antidel');
const { isJidGroup, downloadContentFromMessage } = require('baileys');
const { getAnti } = require('../data');
const config = require('../config');

// Determine where to send deleted message logs. Defaults to 'log'.
const ANTI_DEL_PATH = process.env.ANTI_DEL_PATH || 'log';

// In-memory cache to store recent messages for quick retrieval.
const messageCache = new Map();
const MAX_CACHE_SIZE = 1000;

/**
 * Caches a message for later retrieval.
 * If the message contains media, it attempts to download and store the buffer.
 * @param {string} remoteJid - The JID of the chat.
 * @param {string} messageId - The ID of the message.
 * @param {object} message - The full message object.
 */
const cacheMessage = async (remoteJid, messageId, message) => {
    const cacheKey = `${remoteJid}:${messageId}`;
    const messageCopy = JSON.parse(JSON.stringify(message)); // Deep copy
    const messageType = message.message && Object.keys(message.message)[0];

    const mediaTypes = ['imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage', 'documentMessage'];

    // If the message is a media type, download and cache its content buffer.
    if (mediaTypes.includes(messageType)) {
        try {
            const stream = await downloadContentFromMessage(message.message[messageType], messageType.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            if (buffer.length > 0) {
                messageCopy.message[messageType].mediaBuffer = buffer;
            } else {
                return; // Don't cache if media download fails
            }
        } catch {
            return; // Don't cache on error
        }
    }

    messageCache.set(cacheKey, { message: messageCopy, timestamp: Date.now() });

    // Evict the oldest entry if the cache exceeds its maximum size.
    if (messageCache.size > MAX_CACHE_SIZE) {
        const oldestKey = [...messageCache.keys()][0];
        messageCache.delete(oldestKey);
    }
};

/**
 * Retrieves a message from the cache.
 * @param {string} remoteJid - The JID of the chat.
 * @param {string} messageId - The ID of the message.
 * @returns {object|null} The cached message object or null if not found.
 */
const getFromCache = (remoteJid, messageId) => {
    const cacheKey = `${remoteJid}:${messageId}`;
    const cachedItem = messageCache.get(cacheKey);
    return cachedItem ? cachedItem.message : null;
};

/**
 * Forwards a deleted text message to the log chat.
 * @param {object} sock - The Baileys socket instance.
 * @param {object} deletedMessage - The deleted message object.
 * @param {string} logJid - The JID where the log should be sent.
 * @param {string} logText - The header text for the log message.
 * @param {boolean} isGroup - Whether the message was deleted from a group.
 * @param {object} originalDeleteAction - The original deletion info from Baileys.
 */
const DeletedText = async (sock, deletedMessage, logJid, logText, isGroup, originalDeleteAction) => {
    const originalText = deletedMessage.message?.conversation || deletedMessage.message?.extendedTextMessage?.text || "Unknown content";
    logText += `\n\n*Text:* ${originalText}`;
    
    // Mention the user who deleted the message and the original sender.
    const mentionedJid = isGroup ?
        [originalDeleteAction.key.participant, deletedMessage.key.participant] :
        [originalDeleteAction.key.remoteJid];

    await sock.sendMessage(logJid, {
        text: logText,
        contextInfo: { mentionedJid }
    }, { quoted: deletedMessage });
};

/**
 * Forwards a deleted media message to the log chat.
 * @param {object} sock - The Baileys socket instance.
 * @param {object} deletedMessage - The deleted message object.
 * @param {string} logJid - The JID where the log should be sent.
 * @param {string} logText - The header text for the log message (used as caption).
 */
const DeletedMedia = async (sock, deletedMessage, logJid, logText) => {
    try {
        const messageContent = JSON.parse(JSON.stringify(deletedMessage.message));
        const messageType = Object.keys(messageContent)[0];

        if (!messageContent[messageType]) throw new Error("Invalid message type");
        
        let mediaBuffer = messageContent[messageType].mediaBuffer;

        // Ensure the media buffer is valid and is a Buffer.
        if (!mediaBuffer || !Buffer.isBuffer(mediaBuffer)) {
            // This part is a placeholder for potential re-download logic if needed.
            // For now, we rely on the pre-downloaded buffer from cacheMessage.
            throw new Error("No valid media buffer found in cache.");
        }

        const mediaKey = {
            imageMessage: 'image',
            videoMessage: 'video',
            documentMessage: 'document',
            audioMessage: 'audio',
            stickerMessage: 'sticker'
        }[messageType];

        if (!mediaKey) throw new Error("Invalid media type");

        // Send the media file with the log text as a caption.
        await sock.sendMessage(logJid, {
            [mediaKey]: mediaBuffer,
            caption: ['image', 'video'].includes(mediaKey) ? logText : undefined,
            mimetype: messageContent[messageType].mimetype,
        }, { quoted: deletedMessage });

        // For non-image/video, send the caption as a separate text message.
        if (!['image', 'video'].includes(mediaKey)) {
            await sock.sendMessage(logJid, {
                text: `*Caption:* ${logText}`
            }, { quoted: deletedMessage });
        }
    } catch (error) {
        // If media recovery fails, send a text notification instead.
        await sock.sendMessage(logJid, {
            text: `${logText}\n\n_Error: Could not recover media content._\n*Reason:* ${error.message}`
        }, { quoted: deletedMessage });
    }
};

/**
 * Main handler for the Anti-Delete feature.
 * @param {object} sock - The Baileys socket instance.
 * @param {Array<object>} deletedMessages - An array of message deletion events.
 */
const AntiDelete = async (sock, deletedMessages) => {
    // 1. Cache incoming messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const message of messages) {
            if (message.key && message.message) {
                await cacheMessage(message.key.remoteJid, message.key.id, message);
            }
        }
    });

    // 2. Process deletion events
    for (const deletedInfo of deletedMessages) {
        try {
            // Ignore status updates
            if (deletedInfo.key.remoteJid === 'status@broadcast') continue;
            
            const isGroup = deletedInfo.key.remoteJid.endsWith('@g.us');
            const antiDelSetting = await getAnti(isGroup ? 'gc' : 'dm');
            
            // If anti-delete is disabled for this chat type, skip.
            if (!antiDelSetting) continue;
            
            const deletionTime = new Date().toLocaleTimeString('en-GB', {
                timeZone: 'Asia/Karachi',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            let logHeader = '';
            if (isGroup) {
                const groupMeta = await sock.groupMetadata(deletedInfo.key.remoteJid);
                const groupName = groupMeta.subject;
                const deletorName = deletedInfo.key.participant?.split('@')[0] || 'unknown';
                logHeader = `*🚨 Message Deleted in Group*\n\n*Time:* ${deletionTime}\n*Group:* ${groupName}\n*Deleted by:* @${deletorName}`;
            } else {
                const dmUserName = deletedInfo.key.remoteJid?.split('@')[0] || 'unknown';
                logHeader = `*🚨 Message Deleted in DM*\n\n*Time:* ${deletionTime}\n*By:* @${dmUserName}`;
            }

            // Attempt to retrieve the deleted message from cache or store.
            let originalMessage = getFromCache(deletedInfo.key.remoteJid, deletedInfo.key.id);
            if (!originalMessage && sock.store) {
                try {
                    originalMessage = await sock.store.loadMessage(deletedInfo.key.remoteJid, deletedInfo.key.id);
                } catch {}
            }
            if (!originalMessage) continue;

            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const logDestinationJid = ANTI_DEL_PATH === 'same' ? deletedInfo.key.remoteJid : botId;

            // Check if the message was text or media and call the appropriate handler.
            if (originalMessage.message?.conversation || originalMessage.message?.extendedTextMessage) {
                await DeletedText(sock, originalMessage, logDestinationJid, logHeader, isGroup, deletedInfo);
            } else {
                await DeletedMedia(sock, originalMessage, logDestinationJid, logHeader);
            }
        } catch (error) {
            console.error("Error in AntiDelete handler:", error);
        }
    }
};

module.exports = {
    DeletedText,
    DeletedMedia,
    AntiDelete
};
