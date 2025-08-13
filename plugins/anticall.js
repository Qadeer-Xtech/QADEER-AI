const { cmd } = require('../command');
const { getAntiCallStatus, setAntiCallStatus } = require('../data/anticall');

cmd({
    pattern: "anticall",
    alias: ['acall', 'callblock'],
    desc: "Toggle anti-call feature on or off.",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, reply, text, isCreator }) => {
    if (!isCreator) return reply('This command is for the bot owner only.');

    const action = text.trim().toLowerCase();
    
    try {
        if (action === 'on') {
            await setAntiCallStatus(true);
            return reply('✅ Anti-Call feature has been enabled.');
        } else if (action === 'off') {
            await setAntiCallStatus(false);
            return reply('❌ Anti-Call feature has been disabled.');
        } else {
            const currentStatus = await getAntiCallStatus();
            return reply(
`*Anti-Call Status:* ${currentStatus ? '✅ ON' : '❌ OFF'}

*Usage:*
• .anticall on
• .anticall off`
            );
        }
    } catch (e) {
        console.error("Error in anticall command:", e);
        return reply("An error occurred.");
    }
});
