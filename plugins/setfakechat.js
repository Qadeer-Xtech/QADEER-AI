const { cmd } = require('../command');
const { setFakeChatStatus, isFakeChatEnabled } = require('../data/fakechat_db');

cmd({
    pattern: "setfakechat",
    desc: "Globally enable or disable the fake chat feature.",
    category: "owner",
    filename: __filename
},
async (sock, m, message, { args, isOwner, reply }) => {
    if (!isOwner) return reply("This is an owner-only command.");

    const action = args[0]?.toLowerCase();

    if (action === 'on') {
        await setFakeChatStatus(true);
        return reply("✅ Fake Chat feature has been globally enabled.");
    } else if (action === 'off') {
        await setFakeChatStatus(false);
        return reply("❌ Fake Chat feature has been globally disabled.");
    } else {
        const status = await isFakeChatEnabled();
        return reply(`*Fake Chat Global Status:* ${status ? '✅ ON' : '❌ OFF'}\n\nUsage:\n• .setfakechat on\n• .setfakechat off`);
    }
});