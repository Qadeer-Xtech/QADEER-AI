const { cmd } = require('../command');

cmd({
    pattern: "jid-all",
    alias: ["jid7"],
    desc: "Fetch JID of current chat, all groups and all channels.",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { reply }) => {
    try {
        const chatJid = mek.key.remoteJid;
        let chatType = 'Unknown';

        if (chatJid.endsWith('@g.us')) {
            chatType = 'Group';
        } else if (chatJid.endsWith('@newsletter')) {
            chatType = 'Channel (Newsletter)';
        } else {
            chatType = 'Private Chat';
        }

        // Fetch all groups
        let groupList = "No groups found.";
        try {
            const groups = await conn.groupFetchAllParticipating();
            groupList = Object.values(groups)
                .map((g, i) => `${i + 1}. ${g.subject}\n    ➤ ${g.id}`)
                .join('\n\n') || "No groups found.";
        } catch (e) {
            console.error("❌ Failed fetching groups:", e.message);
        }

        // Fetch all channels
        let channelList = "No channels found.";
        try {
            const chats = Object.values(conn.chats || {});
            channelList = chats
                .filter(c => c.id.endsWith('@newsletter'))
                .map((c, i) => `${i + 1}. ${c.name || 'Unnamed'}\n    ➤ ${c.id}`)
                .join('\n\n') || "No channels found.";
        } catch (e) {
            console.error("❌ Failed fetching channels:", e.message);
        }

        const caption = `
┏━━━━━━━━━━━━━━━━━━━━━━┓
     ✦ *JID Fetch Tool* ✦
┗━━━━━━━━━━━━━━━━━━━━━━┛

🔹 *Current Chat JID*
──────────────────────
• JID: \`${chatJid}\`
• Type: ${chatType}

📋 *All Group JIDs*
──────────────────────
${groupList}

📢 *All Channel JIDs*
──────────────────────
${channelList}
`.trim();

        await reply(caption);

    } catch (error) {
        console.error('❌ GetJID Plugin Error:', error.message);
        await reply('⚠️ Failed to fetch JIDs. Please try again later.');
    }
});