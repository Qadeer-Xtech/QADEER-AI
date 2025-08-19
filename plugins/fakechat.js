const { cmd } = require('../command');
const { isFakeChatEnabled } = require('../data/fakechat_db');
const { startUserSession, stopUserSession, isUserInSession } = require('../data/fakechat_sessions');
const fs = require('fs');
const path = require('path');
const { generateMessageID } = require('@whiskeysockets/baileys');

// Helper function to check for trusted users
function isTrustedUser(userJid, isOwner) {
    if (isOwner) return true;
    const trustedUsersPath = path.join(__dirname, '..', 'data', 'trusted_users.json');
    if (!fs.existsSync(trustedUsersPath)) return false;
    try {
        const trustedUsers = JSON.parse(fs.readFileSync(trustedUsersPath));
        return trustedUsers.includes(userJid);
    } catch (e) {
        console.error("Error reading trusted_users.json:", e);
        return false;
    }
}

cmd({
    pattern: "fakechat",
    desc: "Manage and use the fake chat feature.",
    category: "tools",
    filename: __filename
},
async (sock, m, message, { args, sender, isOwner, reply, q }) => {
    // --- Step 1: Basic Permission Checks ---
    if (!isTrustedUser(sender, isOwner)) {
        return reply("You are not authorized to use this feature.");
    }

    const isGloballyEnabled = await isFakeChatEnabled();
    if (!isGloballyEnabled) {
        return reply("This feature is currently disabled by the owner.");
    }

    const action = args[0]?.toLowerCase();
    const isInSession = isUserInSession(sender);

    // --- Step 2: Handle 'on' and 'off' commands first ---
    if (action === 'on') {
        if (isInSession) {
            return reply("Your Fake Chat Mode is already activated.");
        }
        startUserSession(sender);
        return reply("🎭 *Fake Chat Mode Activated!*\n\nNow, use the command to send a message:\n`.fakechat number|message`");
    }

    if (action === 'off') {
        if (!isInSession) {
            return reply("Your Fake Chat Mode is already deactivated.");
        }
        stopUserSession(sender);
        return reply("✅ Fake Chat Mode Deactivated.");
    }

    // --- Step 3: If not 'on' or 'off', check session status ---
    if (isInSession) {
        // Session is ON, so we expect a message in number|message format
        if (!q || !q.includes('|')) {
            return reply("🎭 *Fake Chat Mode is Active!*\n\nTo send a message, use:\n`.fakechat number|message`\n\nTo turn off, use:\n`.fakechat off`");
        }

        const [numberPart, messagePart] = q.split('|').map(part => part.trim());
        if (!numberPart || !messagePart) {
            return reply("❌ *Invalid Format!*\nExample: `.fakechat 923151105391|Hello World`");
        }

        const targetJid = numberPart.replace(/\D/g, '') + '@s.whatsapp.net';
        const from = m.key.remoteJid;

        try {
            const fakeMessage = {
                key: { remoteJid: from, fromMe: false, participant: targetJid, id: generateMessageID() },
                message: { conversation: messagePart }
            };
            await sock.relayMessage(from, fakeMessage.message, { messageId: fakeMessage.key.id });
            await sock.sendMessage(from, { delete: m.key }); // Optional: deletes the user's command
        } catch (e) {
            console.error("Error in fakechat command:", e);
            reply("An error occurred while sending the fake message.");
        }
    } else {
        // Session is OFF, and the command was not 'on'
        return reply(`*Your Fake Chat Status:* ❌ OFF\n\nUsage:\n• .fakechat on\n• .fakechat off`);
    }
});
