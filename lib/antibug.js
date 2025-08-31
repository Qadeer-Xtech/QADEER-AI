// lib/antibug.js

const { getAntiBug } = require('../data/antibug');
const config = require('../config');

// These are common patterns in crash codes
const DANGEROUS_PATTERNS = [
    /\u200E|\u200F/g, // Left-to-right and Right-to-left marks used excessively
    /([^\s\d\w]){1000,}/g, // A huge block of special characters
];

const MAX_LENGTH = 6000; // Maximum allowed message length

async function handleAntiBug(sock, m) {
    try {
        const isEnabled = await getAntiBug();
        if (!isEnabled) return false;

        const messageType = Object.keys(m.message)[0];
        const messageContent = m.message[messageType];
        
        let text = m.message.conversation || m.message.extendedTextMessage?.text || "";
        if (messageContent.caption) {
            text += ` ${messageContent.caption}`;
        }
        if (messageContent.title) {
            text += ` ${messageContent.title}`;
        }
         if (messageContent.description) {
            text += ` ${messageContent.description}`;
        }

        if (!text || text.length === 0) return false;

        let isBug = false;

        // 1. Check for extreme length
        if (text.length > MAX_LENGTH) {
            isBug = true;
            console.log(`[AntiBug] Detected bug: Message length exceeded (${text.length}/${MAX_LENGTH})`);
        }

        // 2. Check for dangerous patterns
        for (const pattern of DANGEROUS_PATTERNS) {
            if (pattern.test(text)) {
                isBug = true;
                console.log(`[AntiBug] Detected bug: Matched a dangerous pattern.`);
                break;
            }
        }
        
        if (isBug) {
            const sender = m.key.participant || m.key.remoteJid;
            const senderNumber = sender.split('@')[0];

            // Don't block the owner
            if (config.OWNER_NUMBER.includes(senderNumber)) {
                console.log('[AntiBug] Bug detected from owner, skipping block.');
                return false;
            }

            console.log(`[AntiBug] Taking action against ${senderNumber}`);

            // Block the user
            await sock.updateBlockStatus(sender, "block");

            // Delete the message
            await sock.sendMessage(m.key.remoteJid, { delete: m.key });

            // Notify owner
            const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
            await sock.sendMessage(ownerJid, { 
                text: `*⚠️ Anti-Bug System Alert ⚠️*\n\n*Action:* User Blocked & Message Deleted\n*User:* @${senderNumber}`,
                contextInfo: { mentionedJid: [sender] }
            });
            
            return true; // Signal that the message was handled
        }

        return false; // No bug detected
    } catch (error) {
        console.error("Error in Anti-Bug system:", error);
        return false;
    }
}

module.exports = { handleAntiBug };