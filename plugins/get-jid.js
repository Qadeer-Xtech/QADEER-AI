const { cmd } = require('../command');

cmd({
    pattern: "jid",
    alias: ["id", "chatid", "gjid"],
    desc: "Get full JID of current chat/user.",
    react: "🆔",
    category: "new",
    filename: __filename,
}, async (conn, mek, m, {
    from, isGroup, isOwner, reply
}) => {
    // Note: 'sender' variable is often not needed here.
    // In a group, 'from' is the group JID.
    // In a private chat, 'from' is the user's JID.

    try {
        // Owner check aam tor par aisy commands k liye rakha jata hai.
        // Agar aap chahte hain ke koi bhi use kar saky to is hissay ko hata dein.
        if (!isOwner) {
            return reply("❌ *Sirf Owner is command ko use kar sakta hai.*");
        }

        if (isGroup) {
            // 'from' variable mein group ka JID pehle se hi mukammal hota hai.
            return reply(`👥 *Group JID:*\n\`\`\`${from}\`\`\``);
        } else {
            // Private chat mein, 'from' user ka JID hota hai.
            return reply(`👤 *User JID:*\n\`\`\`${from}\`\`\``);
        }
    } catch (e) {
        console.error("JID Command Error:", e);
        reply(`⚠️ JID haasil karne mein error: \n${e.message}`);
    }
});
