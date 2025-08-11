const { cmd } = require("../command");

cmd({
    pattern: "channel-id",
    alias: ["newsletter", "id"],
    react: "📡",
    desc: "Get WhatsApp Channel info from a link.",
    category: "whatsapp",
    filename: __filename,
}, async (conn, m, { q, from }) => {
    try {
        if (!q) {
            const replyText = "❎ Please provide a WhatsApp Channel link.\n\n*Example:* .channel-id https://whatsapp.com/channel/123456789";
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }

        const match = q.match(/whatsapp\.com\/channel\/([\w-]+)/);
        if (!match) {
            const replyText = "⚠️ *Invalid channel link format.*\n\nMake sure it looks like:\nhttps://whatsapp.com/channel/xxxxxxxxx";
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }

        const inviteId = match[1];

        let metadata;
        try {
            // FIX: Aapka original function wapas istemal kiya gaya hai
            metadata = await conn.newsletterMetadata("invite", inviteId);
        } catch (e) {
            const replyText = "❌ Failed to fetch channel metadata. Make sure the link is correct or your bot supports newsletters.";
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }
        
        if (!metadata || !metadata.id) {
            return await conn.sendMessage(from, { text: "❌ Channel not found or link is inaccessible." }, { quoted: m });
        }

        // Channel ki maloomat ko format karein
        const creationDate = metadata.creation_time ? new Date(metadata.creation_time * 1000).toLocaleString("en-GB") : "Unknown";
        
        const infoText = `*— 乂 Channel Info 乂 —*\n\n` +
            `*🆔 ID:* ${metadata.id}\n` +
            `*📌 Name:* ${metadata.name}\n` +
            `*👥 Followers:* ${metadata.subscribers?.toLocaleString() || "N/A"}\n` +
            `*📅 Created:* ${creationDate}`;

        // Agar channel ka profile picture (preview) hai, to usay istemal karein
        if (metadata.preview) {
            await conn.sendMessage(from, {
                // pps.whatsapp.net se poora URL banayein
                image: { url: `https://pps.whatsapp.net${metadata.preview}` },
                caption: infoText
            }, { quoted: m });
        } else {
            // Agar picture nahi hai, to sirf text bhej dein
            await conn.sendMessage(from, { text: infoText }, { quoted: m });
        }

    } catch (error) {
        console.error("❌ Error in channel-id plugin:", error);
        await conn.sendMessage(from, { text: "⚠️ An unexpected error occurred while fetching channel info." }, { quoted: m });
    }
});
