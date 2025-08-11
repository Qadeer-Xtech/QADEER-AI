const { cmd } = require('../command');

cmd({
    pattern: "demote",
    alias: ["d", "dismiss", "removeadmin"],
    desc: "Demotes a group admin to a normal member",
    category: "group",
    react: "⬇️",
    filename: __filename
},
async (conn, mek, m, {
    from, quoted, q, isGroup, sender, botNumber, isBotAdmins, isAdmins, participants, groupAdmins, reply
}) => {
    if (!isGroup) return reply("❌ This command is only for groups.");
    if (!isAdmins) return reply("❌ Only *group admins* can use this command.");
    if (!isBotAdmins) return reply("❌ I must be *admin* to demote someone.");

    let target;
    if (quoted) {
        target = quoted.sender;
    } else if (q && q.includes("@")) {
        const number = q.replace(/[^0-9]/g, "");
        target = number + "@s.whatsapp.net";
    } else {
        return reply("❌ Please *reply to a message* or *mention* the user to demote.");
    }

    if (target === botNumber) return reply("❌ I cannot demote myself.");
    if (!groupAdmins.includes(target)) return reply("❌ This user is *not an admin*.");

    try {
        await conn.groupParticipantsUpdate(from, [target], "demote");
        reply(`✅ Successfully demoted @${target.split("@")[0]}`, { mentions: [target] });
    } catch (e) {
        return reply(`❌ Failed to demote user.\n\n*Error:* ${e?.message || e}`);
    }
});
