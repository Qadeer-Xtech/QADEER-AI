const { isFakeChatEnabled } = require('../data/fakechat_db');
const { isUserInSession } = require('../data/fakechat_sessions');
const { generateMessageID } = require('@whiskeysockets/baileys');

async function handleFakeChat(sock, m) {
    // 1. Check if the feature is globally enabled
    const isEnabled = await isFakeChatEnabled();
    if (!isEnabled) return false;

    // 2. Get sender and check if they are in a session
    const sender = m.key.fromMe ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : (m.key.participant || m.key.remoteJid);
    if (!isUserInSession(sender)) return false;

    // 3. Get the message text
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    
    // Ignore commands so user can turn the feature off
    if (text.startsWith(require('../config').PREFIX)) return false;

    // 4. Parse the text: number|message
    if (!text.includes('|')) return false;
    const [numberPart, messagePart] = text.split('|').map(part => part.trim());
    if (!numberPart || !messagePart) return false;

    const targetJid = numberPart.replace(/\D/g, '') + '@s.whatsapp.net';
    const from = m.key.remoteJid;

    console.log(`[FakeChat Handler] Intercepted message from ${sender}. Faking as ${targetJid}.`);

    try {
        const fakeMessage = {
            key: {
                remoteJid: from,
                fromMe: false,
                participant: targetJid,
                id: generateMessageID()
            },
            message: {
                conversation: messagePart
            }
        };

        await sock.relayMessage(from, fakeMessage.message, { messageId: fakeMessage.key.id });
        
        // Return true to stop further processing of the original message
        return true; 
    } catch (e) {
        console.error("Error in fakechat handler:", e);
        return false; // Let it fail silently or send an error to the user
    }
}

module.exports = { handleFakeChat };
