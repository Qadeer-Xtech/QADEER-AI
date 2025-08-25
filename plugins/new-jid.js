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

        // Fetch all groups (This part was okay)
        let groupList = "No groups found.";
        try {
            const groups = await conn.groupFetchAllParticipating();
            if (groups && Object.values(groups).length > 0) {
                groupList = Object.values(groups)
                    .map((g, i) => `${i + 1}. ${g.subject}\n    ➤ ${g.id}`)
                    .join('\n\n');
            }
        } catch (e) {
            console.error("❌ Failed fetching groups:", e);
            groupList = "Could not fetch groups due to an error.";
        }

        // Fetch all channels (FIXED LOGIC) 🔧
        let channelList = "No channels found.";
        try {
            // This is the correct and reliable method to query subscribed newsletters/channels
            const result = await conn.query({
                tag: 'iq',
                attrs: {
                    to: '@newsletter',
                    type: 'get',
                    xmlns: 'newsletter',
                },
                content: [{
                    tag: 'list',
                    attrs: {},
                }],
            });

            // The result contains a list of channels, we need to parse it
            const channels = result.content?.[0]?.content;
            if (channels && channels.length > 0) {
                channelList = channels
                    .map((channel, i) => {
                        const jid = channel.attrs?.jid;
                        // Channel name is usually found nested inside the content
                        const name = channel.content?.find(c => c.tag === 'name')?.content?.toString() || 'Unnamed Channel';
                        return `${i + 1}. ${name}\n    ➤ ${jid}`;
                    })
                    .join('\n\n');
            }
        } catch (e) {
            console.error("❌ Failed fetching channels:", e); // This logs the full error for debugging
            channelList = "Could not fetch channels due to an error.";
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
        console.error('❌ GetJID Plugin Error:', error); // Log the full error object
        await reply('⚠️ Failed to fetch JIDs. Please try again later.');
    }
});
