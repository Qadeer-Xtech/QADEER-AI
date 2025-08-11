const { cmd } = require('../command');

cmd({
    pattern: "promote",
    alias: ["p", "makeadmin", "admin"],
    desc: "Promotes a group member to admin",
    category: "group",
    react: "⬆️",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, q, isGroup, sender, botNumber, isBotAdmins, isAdmins, participants, groupAdmins, reply
}) => {
    if (!isGroup) return reply("❌ This command is only for groups.");
    if (!isAdmins) return reply("❌ Only *group admins* can use this command.");
    if (!isBotAdmins) return reply("❌ I must be *admin* to promote someone.");

    let target;
    if (quoted) {
        target = quoted.sender;
    } else if (q && q.includes("@")) {
        const number = q.replace(/[^0-9]/g, "");
        target = number + "@s.whatsapp.net";
    } else {
        return reply("❌ Please *reply to a message* or *mention* the user to promote.");
    }

    if (target === botNumber) return reply("❌ I cannot promote myself.");
    if (groupAdmins.includes(target)) return reply("❌ This user is *already an admin*.");

    try {
        await conn.groupParticipantsUpdate(from, [target], "promote");
        reply(`✅ Successfully promoted @${target.split("@")[0]} to admin.`, { mentions: [target] });
    } catch (e) {
        return reply(`❌ Failed to promote user.\n\n*Error:* ${e?.message || e}`);
    }
});
