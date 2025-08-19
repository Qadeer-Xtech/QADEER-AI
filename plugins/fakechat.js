const { cmd } = require('../command');
const { isFakeChatEnabled } = require('../data/fakechat_db');
const { startUserSession, stopUserSession, isUserInSession } = require('../data/fakechat_sessions');
const fs = require('fs');
const path = require('path');

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
    desc: "Enable or disable your personal fake chat mode.",
    category: "tools",
    filename: __filename
},
async (sock, m, message, { args, sender, isOwner, reply }) => {
    if (!isTrustedUser(sender, isOwner)) {
        return reply("You are not authorized to use this feature.");
    }

    const isGloballyEnabled = await isFakeChatEnabled();
    if (!isGloballyEnabled) {
        return reply("This feature is currently disabled by the owner.");
    }

    const action = args[0]?.toLowerCase();

    if (action === 'on') {
        startUserSession(sender);
        return reply("🎭 *Fake Chat Mode Activated!*\n\nNow, send messages in the format:\n`number|message`\n\nExample:\n`923151105391|Hello World`");
    } else if (action === 'off') {
        stopUserSession(sender);
        return reply("✅ Fake Chat Mode Deactivated.");
    } else {
        const status = isUserInSession(sender);
        return reply(`*Your Fake Chat Status:* ${status ? '🎭 ON' : '❌ OFF'}\n\nUsage:\n• .fakechat on\n• .fakechat off`);
    }
});
