const { cmd } = require('../command');
const { isFakeChatEnabled } = require('../data/fakechat_db');
const { startUserSession, stopUserSession, isUserInSession } = require('../data/fakechat_sessions');
const fs = require('fs');
const path = require('path');
const { generateMessageID } = require('@whiskeysockets/baileys');

// Helper to check for trusted users
function isTrustedUser(userJid, isOwner) {
    if (isOwner) return true;
    const trustedUsersPath = path.join(__dirname, '..', 'data', 'trusted_users.json');
    if (!fs.existsSync(trustedUsersPath)) return false;
    const trustedUsers = JSON.parse(fs.readFileSync(trustedUsersPath));
    return trustedUsers.includes(userJid);
}

cmd({
    pattern: "fakechat",
    desc: "Manage and use the fake chat feature.",
    category: "tools",
    filename: __filename
},
async (sock, m, message, { args, sender, isOwner, reply, q }) => {
    // --- Basic Checks ---
    if (!isTrustedUser(sender, isOwner)) {
        return reply("You are not authorized to use this feature.");
    }

    const isGloballyEnabled = await isFakeChatEnabled();
    if (!isGloballyEnabled) {
        return reply("This feature is currently disabled by the owner.");
    }

    constisInSession = isUserInSession(sender);
    const action = args[0]?.toLowerCase();

    // --- Logic for when session is ALREADY ON ---
    if (isInSession) {
        if (action === 'off') {
            stopUserSession(sender);
            return reply("✅ Fake Chat Mode Deactivated.");
        }
        
        if (action === 'on') {
            return reply("Your Fake Chat Mode is already activated.");
        }

        // If session is ON and user is not trying to turn it off, treat as fake message
        if (!q || !q.includes('|')) {
            return reply("🎭 *Fake Chat Mode is Active!*\n\nUse the format to send a message:\n`.fakechat number|message`\n\nOr turn it off:\n`.fakechat off`");
        }
        
        const [numberPart, messagePart] = q.split('|').map(part => part.trim());
        if (!numberPart || !messagePart) {
            return reply("❌ *Invalid Format!*\nExample: `.fakechat 923151105391|Hello World`");
        }

        const targetJid = numberPart.replace(/\D/g, '') + '@s.whatsapp.net';
        const from = m.key.remoteJid;

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
            await sock.sendMessage(from, { delete: m.key }); // Optional: deletes the command
            return;
        } catch (e) {
            console.error("Error in fakechat command:", e);
            return reply("An error occurred while sending the fake message.");
        }
    }

    // --- Logic for when session is OFF ---
    if (!isInSession) {
        if (action === 'on') {
            startUserSession(sender);
            return reply("🎭 *Fake Chat Mode Activated!*\n\nNow, use the command again to send a message:\n`.fakechat number|message`");
        }
        
        if (action === 'off') {
             return reply("Your Fake Chat Mode is already deactivated.");
        }

        // If session is off and user is not trying to turn it on, show status.
        return reply(`*Your Fake Chat Status:* ❌ OFF\n\nUsage:\n• .fakechat on\n• .fakechat off`);
    }
});
