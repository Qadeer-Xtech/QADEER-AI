const { cmd } = require('../command');
const { setAntiCall } = require('../data/anticall');

cmd({
    pattern: "anticall",
    alias: ['acall'],
    desc: "Toggle anti-call feature",
    category: "misc",
    filename: __filename
},
async (conn, mek, m, { reply, text, isCreator }) => {
    if (!isCreator) return reply('This command is only for the bot owner');
    
    try {
        const action = (text || "").toLowerCase().trim();
        
        if (action === 'on') {
            await setAntiCall(true);
            return reply('✅ Anti-call has been enabled');
        } 
        else if (action === 'off') {
            await setAntiCall(false);
            return reply('❌ Anti-call has been disabled');
        } 
        else {
            return reply('Usage:\n• .anticall on\n• .anticall off');
        }
    } catch (e) {
        console.error("Error in anticall command:", e);
        return reply("An error occurred while processing your request.");
    }
});