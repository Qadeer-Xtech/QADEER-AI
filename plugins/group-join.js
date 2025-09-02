// File: group-join.js
const { cmd } = require('../command');

cmd({
    pattern: 'join',
    alias: ['joinme', 'f_join'],
    desc: 'To Join a Group from an Invite link',
    category: 'group',
    use: '<Group Link>',
    filename: __filename
}, async (bot, msg, text, { from, q, quoted, isPatron, reply }) => {

    await bot.sendMessage(from, { react: { text: '📬', key: msg.key } });

    try {
        // This appears to be a check for a premium/authorized user
        if (!isPatron) {
            return reply("You don't have permission to use this command.");
        }

        if (!q && !quoted) {
            return reply('*Please provide the Group Link* 🖇️');
        }

        let linkCode;
        const linkPrefix = 'https://chat.whatsapp.com/';
        
        // Extract link code from text or replied message
        if (q && q.includes(linkPrefix)) {
            linkCode = q.split(linkPrefix)[1];
        } else if (quoted && quoted.text && quoted.text.includes(linkPrefix)) {
            linkCode = quoted.text.split(linkPrefix)[1];
        }

        if (!linkCode) {
            return reply('❌ *Invalid Group Link* 🖇️');
        }
        
        await bot.groupAcceptInvite(linkCode);
        await bot.sendMessage(from, { text: '✔️ *Successfully Joined*' }, { quoted: msg });

    } catch (error) {
        await bot.sendMessage(from, { react: { text: '❌', key: msg.key } });
        console.log(error);
        reply('❌ *An Error Occurred!!*\n\n' + error);
    }
});
