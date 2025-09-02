const { cmd } = require('../command');
const config = require('../config');

cmd({
    on: 'body'
}, async (sock, m, store, { from, body, isGroup, isAdmins, isBotAdmins, reply, sender }) => {
    try {
        // Define the list of bad words
        const badWords = [
            'wtf', 'fuck', 'sex', 'xxx', 'ponnaya', 'pakaya', 'huththa', 'hutto', 'mia'
        ];
        
        // This feature only works in groups where the bot is an admin
        // and it should not trigger for group admins.
        if (!isGroup || isAdmins || !isBotAdmins) {
            return;
        }

        const messageBodyLower = body.toLowerCase();
        // Check if the message contains any of the bad words
        const hasBadWord = badWords.some(word => messageBodyLower.includes(word));

        // If a bad word is found and the feature is enabled in config, delete the message
        if (hasBadWord && config.ANTI_BAD_WORD === 'true') {
            // Delete the offending message
            await sock.sendMessage(from, { delete: m.key }, { quoted: m });
            
            // Send a warning message
            await sock.sendMessage(from, { text: '🚫 ⚠️ BAD WORDS NOT ALLOWED ⚠️ 🚫' }, { quoted: m });
        }

    } catch (error) {
        console.error(error);
        reply('An error occurred while processing the message.');
    }
});
