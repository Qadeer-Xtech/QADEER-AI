// msg.js

const {
    proto,
    downloadContentFromMessage,
    getContentType
} = require('baileys');
const fs = require('fs');

/**
 * Downloads media from a message and saves it to a file.
 * @param {object} message - The message object containing the media.
 * @param {string} [filename] - Optional filename to save the media as.
 * @returns {Promise<string|undefined>} The path to the saved file or undefined.
 */
const downloadMediaMessage = async (message, filename) => {
    // If the message is a viewOnce message, extract the inner message
    if (message.mtype === 'viewOnceMessage') {
        message.type = message.msg.mtype;
    }

    const extensionMap = {
        imageMessage: 'jpg',
        videoMessage: 'mp4',
        audioMessage: 'm4a',
        stickerMessage: 'webp'
    };

    const fileExtension = extensionMap[message.type] ||
        message.msg?.documentMessage?.fileName?.split('.')?.pop()?.toLowerCase()?.replace('jpeg', 'jpg').replace('png', 'jpg').replace('m4a', 'mp3') || 'bin';

    const finalFilename = filename ? `${filename}.${fileExtension}` : `media.${fileExtension}`;

    const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'];

    if (mediaTypes.includes(message.type)) {
        const stream = await downloadContentFromMessage(message.msg, message.type.replace('Message', '').toLowerCase());
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        fs.writeFileSync(finalFilename, buffer);
        return fs.readFileSync(finalFilename);
    }
};


/**
 * Serializes a Baileys message object to add helpful properties and methods.
 * @param {object} sock - The Baileys socket instance.
 * @param {object} m - The raw message object from Baileys.
 * @param {object} store - The Baileys store for message history.
 * @returns {object|undefined} The serialized message object (m) or undefined if invalid.
 */
const sms = (sock, m, store) => {
    if (!m) return m;

    let M = proto.WebMessageInfo;

    // Start enriching the message object (m)
    if (m.key) {
        m.id = m.key.id;
        m.isBot = (m.id.startsWith('BAES') && m.id.length === 16);
        m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat.endsWith('@g.us');
        m.sender = m.fromMe ? (sock.user.id.split(':')[0] + '@s.whatsapp.net') : (m.isGroup ? m.key.participant : m.key.remoteJid);
    }

    if (!m.message) {
        console.error("Message object is undefined. Skipping processing.");
        return m;
    }

    m.mtype = getContentType(m.message);
    m.msg = (m.mtype === 'viewOnceMessage') ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype];

    // Extract the message body/text/caption
    try {
        m.body =
            (m.mtype === 'conversation') ? m.message.conversation :
            (m.mtype === 'imageMessage' && m.message.imageMessage.caption) ? m.message.imageMessage.caption :
            (m.mtype === 'videoMessage' && m.message.videoMessage.caption) ? m.message.videoMessage.caption :
            (m.mtype === 'extendedTextMessage') ? m.message.extendedTextMessage.text :
            (m.mtype === 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
            (m.mtype === 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
            (m.mtype === 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId :
            '';
    } catch {
        m.body = false;
    }

    const quotedMessage = m.msg?.contextInfo?.quotedMessage ?? null;
    m.mentionedJid = m.msg?.contextInfo?.mentionedJid ?? [];

    // --- Process Quoted Message ---
    if (quotedMessage) {
        let quotedMtype = getContentType(quotedMessage);
        let quotedMsg = quotedMessage[quotedMtype];

        if (quotedMtype === 'viewOnceMessage') {
            quotedMtype = getContentType(quotedMsg.message);
            quotedMsg = quotedMsg.message[quotedMtype];
        }

        const quotedData = (typeof quotedMsg === 'string') ? { text: quotedMsg } : Object.assign({}, quotedMsg);
        
        quotedData.mtype = quotedMtype;
        quotedData.id = m.msg.contextInfo.stanzaId;
        quotedData.chat = m.msg.contextInfo.remoteJid || m.chat;
        quotedData.isBot = quotedData.id ? quotedData.id.startsWith('BAES') && quotedData.id.length === 16 : false;
        quotedData.isBaileys = quotedData.id ? quotedData.id.startsWith('BAE5') && quotedData.id.length === 16 : false;
        quotedData.sender = sock.decodeJid(m.msg.contextInfo.participant);
        quotedData.fromMe = (quotedData.sender === (sock.user && sock.user.id));
        quotedData.text = quotedData.text || quotedData.caption || quotedData.conversation || quotedData.contentText || quotedData.selectedDisplayText || quotedData.title || '';
        quotedData.mentionedJid = m.msg.contextInfo?.mentionedJid ?? [];

        // Add helper methods to the quoted object
        quotedData.delete = async () => sock.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: false,
                id: quotedData.id,
                participant: quotedData.sender
            }
        });
        quotedData.download = () => sock.downloadMediaMessage(quotedData);
        
        const fakeObj = M.fromObject({
            key: {
                remoteJid: quotedData.chat,
                fromMe: quotedData.fromMe,
                id: quotedData.id
            },
            message: quotedMessage,
            ...(m.isGroup ? {
                participant: quotedData.sender
            } : {})
        });
        
        m.forwardMessage = (jid, force = true, options = {}) => sock.copyNForward(jid, fakeObj, force, { contextInfo: { isForwarded: true } }, options);
        m.getQuotedMessage = m.getQuotedObj = async () => {
            if (!quotedData.id) return false;
            const q_msg = await store.loadMessage({
                remoteJid: m.chat,
                id: quotedData.id,
                fromMe: false,
                participant: quotedData.sender
            });
            return q_msg?.message ? exports.sms(sock, q_msg, store) : false;
        };

        m.quoted = quotedData;
    }
    
    // Fallback for text from other message types
    m.text = m.msg?.text || m.msg?.caption || m.message?.conversation || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || '';

    // --- Add Helper Methods to Main Message Object ---
    m.copy = () => exports.sms(sock, M.fromObject(M.toObject(m)));
    m.copyNForward = (jid = m.chat, force = true, options = {}) => sock.copyNForward(jid, m, force, options);

    // Reply functions
    m.reply = (text, jid = m.chat, options = { mentions: [m.sender] }) => sock.sendMessage(jid, { text, contextInfo: { mentionedJid: options.mentions } }, { quoted: m });
    
    return m;
};


module.exports = {
    sms,
    downloadMediaMessage
};
