// File: group-leave.js
const { sleep } = require('../lib/functions');
const { cmd } = require('../command');

cmd({
    pattern: 'leave',
    alias: ['leavegc', 'leftgc', 'left'],
    desc: 'Leave the group',
    category: 'owner',
    filename: __filename
}, async (bot, msg, text, { from, isGroup, senderNumber, reply }) => {
    
    await bot.sendMessage(from, { react: { text: '👋', key: msg.key } });

    try {
        if (!isGroup) {
            return reply('This command can only be used in groups.');
        }

        // Check if the user is the bot owner
        const botId = bot.user.id.split(':')[0];
        const botLid = bot.user.lid ? bot.user.lid.split(':')[0] : null;
        if (senderNumber !== botId && senderNumber !== botLid) {
            return reply('❌ Only group admins can use this command.'); // Note: Original reply text is misleading
        }

        await reply('👋 Leaving group...');
        await sleep(1500); // 1.5 seconds delay
        await bot.groupLeave(from);

    } catch (error) {
        console.error('Leave error:', error);
        if (error.data === 'item-not-found' || error.data === 'forbidden' || error.status === 403 || error.status === 404) {
            // These errors are expected if the bot leaves successfully, so we can ignore them.
            return;
        }
        reply('❌ Error: ' + error.message);
    }
});
