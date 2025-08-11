const { cmd } = require('../command');

cmd({
    pattern: "gidlink",
    alias: ["groupidlink", "glinkid"],
    desc: "Get group ID from a WhatsApp group invite link",
    category: "utility",
    react: "🔗",
    filename: __filename,
}, async (conn, mek, m, { args, reply, react }) => {
    try {
        const link = args[0];

        if (!link?.includes('chat.whatsapp.com/')) {
            await react("⚠️");
            return reply("❌ Ghalat ya na-mukammal group link.\n\n✅ *Istemaal ka tareeqa:*\n.gidlink https://chat.whatsapp.com/xxxxxx");
        }

        const code = link.split('https://chat.whatsapp.com/')[1];
        const info = await conn.groupGetInviteInfo(code);

        if (!info?.id) {
            await react("❌");
            return reply("❌ Group ki maloomat nahi mil saki. Link ghalat ya expire ho chuka ho sakta hai.");
        }
  
        const responseMessage = `✅ *Group ID mil gaya!*\n📎 *Neeche diye gaye ID ko copy karein:*\n\n\`\`\`${info.id}\`\`\``;

        await react("✅");
        return reply(responseMessage); 

    } catch (err) {
        console.error("❌ gidlink error:", err);
        await react("❌");
        reply("⚠️ Group ID haasil karte waqt error agaya.");
    }
});
