const { cmd } = require('../command');
const { getGroupAdmins } = require('../lib/functions'); // Sirf zaroori function import kiya

cmd({
    pattern: "tagadmins",
    react: "👑",
    alias: ["t admins"], // Alias saaf kiya gaya
    desc: "To tag all admins of the group.",
    category: "group",
    use: '.tagadmins [optional message]',
    filename: __filename
},
async (conn, m, { from, isGroup, participants, q }) => { // Standard aur saaf parameters
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, { text: "❌ This command can only be used in groups." }, { quoted: m });
        }
        
        const groupInfo = await conn.groupMetadata(from).catch(() => null);
        if (!groupInfo) {
            return await conn.sendMessage(from, { text: "❌ Failed to fetch group information." }, { quoted: m });
        }

        const admins = getGroupAdmins(participants);
        if (admins.length === 0) {
            return await conn.sendMessage(from, { text: "❌ No admins found in this group." }, { quoted: m });
        }

        const groupName = groupInfo.subject;
        const message = q || "Attention Admins"; // 'q' ka istemal, jo zyada reliable hai
        const emojis = ['👑', '⚡', '🌟', '✨', '🎖️', '💎', '🔱', '🛡️', '🚀', '🏆'];
        
        let tagMessage = `*▢ Group:* ${groupName}\n` +
                         `*▢ Message:* ${message}\n\n` +
                         `┌───⊷ *ADMINS* ⊷───\n`;

        for (let adminJid of admins) {
            let randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            tagMessage += `│ ${randomEmoji} @${adminJid.split('@')[0]}\n`;
        }

        tagMessage += "└───⬣ QADEER-AI ⬣───";

        await conn.sendMessage(from, { text: tagMessage, mentions: admins }, { quoted: m });

    } catch (e) {
        console.error("TagAdmins Error:", e);
        const errorText = `❌ An error occurred: ${e.message || e}`;
        await conn.sendMessage(from, { text: errorText }, { quoted: m });
    }
});
