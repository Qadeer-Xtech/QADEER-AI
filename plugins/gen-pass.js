// gen-pass.js
const crypto = require('crypto');
const { cmd } = require('../command');

cmd({
    pattern: 'gpass',
    desc: 'Generate a strong password.',
    category: 'other',
    react: '🔐',
    filename: __filename,
    use: '<length>'
}, async (sock, message, { from, quoted, args, reply }) => {

    try {
        const length = args[0] ? parseInt(args[0]) : 12;

        if (isNaN(length) || length < 8) {
            return reply('❌ Please provide a valid length for the password (Minimum 8 Characters).');
        }

        const generatePassword = (len) => {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+[]{}|;:,.<>?';
            let password = '';
            for (let i = 0; i < len; i++) {
                const randomIndex = crypto.randomInt(0, chars.length);
                password += chars[randomIndex];
            }
            return password;
        };

        const password = generatePassword(length);
        const responseText = `🔐 *Your Strong Password* 🔐\n\nPlease find your generated password below:\n\n${password}\n\n*ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴀᴛʀᴏɴTᴇᴄʜＸ*`;
        
        await sock.sendMessage(from, { text: responseText }, { quoted: quoted });

    } catch (error) {
        console.error(error);
        reply(`❌ Error generating password: ${error.message}`);
    }
});
