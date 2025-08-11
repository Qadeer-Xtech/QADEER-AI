const { cmd } = require('../command');

cmd({
    pattern: "remove",
    alias: ["kick", "k"],
    desc: "Removes a member from the group",
    category: "group",
    react: "🤡",
    filename: __filename
},
async (conn, mek, m, {
    from, q, isGroup, isBotAdmins, isOwner, reply, quoted, senderNumber
}) => {
    // Must be used in a group
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    // Only bot owner can use this command
    if (!isOwner) return reply("❌ Only the bot owner can use this command.");

    // Bot must be admin
    if (!isBotAdmins) return reply("❌ I need to be an admin to use this command.");

    let number;
    if (m.quoted) {
        number = m.quoted.sender.split("@")[0];
    } else if (q && q.includes("@")) {
        number = q.replace(/[@\s]/g, '');
    } else {
        return reply("❌ Please reply to a message or mention a user to remove.");
    }

    const jid = number + "@s.whatsapp.net";

    try {
        await conn.groupParticipantsUpdate(from, [jid], "remove");
        reply(`✅ Successfully removed @${number}`, { mentions: [jid] });
    } catch (error) {
        console.error("Remove command error:", error);
        reply("❌ Failed to remove the member.");
    }
});
