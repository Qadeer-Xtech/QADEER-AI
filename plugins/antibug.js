// plugins/antibug.js

const { cmd } = require('../command');
const { getAntiBug, setAntiBug } = require('../data/antibug');

cmd({
    pattern: "antibug",
    alias: ['abug', 'bug'],
    desc: "Toggle anti-bug feature",
    category: "owner",
    filename: __filename
},
async (conn, mek, m, { from, reply, text, isCreator }) => {
    if (!isCreator) return reply('This command is only for the bot owner');
    
    try {
        const currentStatus = await getAntiBug();
        
        if (!text || text.toLowerCase() === 'status') {
            return reply(`*Anti-Bug System Status:* ${currentStatus ? '✅ ON' : '❌ OFF'}\n\nUsage:\n• .antibug on - Enable\n• .antibug off - Disable`);
        }
        
        const action = text.toLowerCase().trim();
        
        if (action === 'on') {
            await setAntiBug(true);
            return reply('✅ Anti-Bug system has been enabled');
        } 
        else if (action === 'off') {
            await setAntiBug(false);
            return reply('❌ Anti-Bug system has been disabled');
        } 
        else {
            return reply('Invalid command. Usage:\n• .antibug on\n• .antibug off\n• .antibug status');
        }
    } catch (e) {
        console.error("Error in antibug command:", e);
        return reply("An error occurred while processing your request.");
    }
});
