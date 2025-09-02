// extra-fun.js

const { cmd } = require('../command');
const config = require('../config');

// --- Love Compatibility Test Command ---
cmd({
    pattern: 'lovetest',
    alias: ['friend', 'compatibility'],
    desc: 'Calculate the compatibility score between two users.',
    category: 'fun',
    react: '',
    filename: __filename,
    use: '@tag1 @tag2'
}, async (sock, m, message, { args, reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '💖', key: message.key } });
    try {
        if (args.length < 2) {
            return reply('Tag two users! Example: .lovetest @user1 @user2');
        }

        let user1 = message.mentionedJid[0];
        let user2 = message.mentionedJid[1];
        const devJid = config.DEV ? config.DEV + '@s.whatsapp.net' : null;

        // Calculate a random compatibility score
        let score = Math.floor(Math.random() * 1000) + 1;

        // If a developer is tagged, the score is always 1000
        if (user1 === devJid || user2 === devJid) {
            score = 1000;
            return reply(`💖 Compatibility between @${user1.split('@')[0]} and @${user2.split('@')[0]}: ${score}+/1000 💖`);
        }

        const responseText = `💖 Compatibility between @${user1.split('@')[0]} and @${user2.split('@')[0]}: ${score}/1000 💖`;
        await sock.sendMessage(m.chat, { text: responseText, mentions: [user1, user2] }, { quoted: m });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});


// --- Aura Score Command ---
cmd({
    pattern: 'aura',
    desc: 'Calculate aura score of a user.',
    category: 'fun',
    filename: __filename,
    use: '@tag'
}, async (sock, m, message, { args, reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '💀', key: message.key } });
    try {
        if (args.length < 1) {
            return reply('Please mention a user to calculate their aura.\nUsage: .aura @user');
        }

        let taggedUser = message.mentionedJid[0];
        const devJid = config.DEV ? config.DEV + '@s.whatsapp.net' : null;

        // Calculate a random aura score
        let auraScore = Math.floor(Math.random() * 1000) + 1;

        // If a developer is tagged, the aura score is extremely high
        if (taggedUser === devJid) {
            auraScore = 999999;
            return reply(`💀 Aura of @${taggedUser.split('@')[0]}: ${auraScore}+ 🗿`);
        }

        const responseText = `💀 Aura of @${taggedUser.split('@')[0]}: ${auraScore}/1000 🗿`;
        await sock.sendMessage(m.chat, { text: responseText, mentions: [taggedUser] }, { quoted: m });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});


// --- Roast Command ---
cmd({
    pattern: 'roast',
    alias: ['insult'],
    desc: 'Roast someone in Pigdin',
    category: 'fun',
    react: '',
    filename: __filename,
    use: '@tag'
}, async (sock, m, message, { q, reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '🔥', key: message.key } });

    // A collection of Pidgin English roasts
    const roasts = [
        "Your brain dey buffer like bad network!",
        "Bro, your sense get low battery, go charge am!",
        "If mumu was a profession, you go don be CEO!",
        "Even plantain wey don ripe still get more sense pass you!",
        // ... (and many others)
    ];

    const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    const senderName = '@' + m.sender.split('@')[0];
    const taggedUserJid = message.mentionedJid[0] || (m.quoted && m.quoted.sender);

    if (!taggedUserJid) {
        return reply('Usage: .roast @user (Tag someone to roast them!)');
    }

    const taggedUserName = '@' + taggedUserJid.split('@')[0];
    const responseText = `${taggedUserName} ${randomRoast}\n\n> This is all for fun, don't take it seriously!`;
    
    await sock.sendMessage(m.chat, { text: responseText, mentions: [m.sender, taggedUserJid] }, { quoted: m });
});


// --- Magic 8-Ball Command ---
cmd({
    pattern: '8ball',
    desc: 'Magic 8-Ball gives answers',
    category: 'fun',
    filename: __filename,
    use: '.8ball <yes/no question>'
}, async (sock, m, message, { from, q, reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '🎱', key: message.key } });

    if (!q) {
        return reply('Ask a yes/no question! Example: .8ball Will I be rich?');
    }

    const answers = [
        'Absolutely!', 'Yes!', 'No way!', 'I don\'t think so.', 'No.', 'Maybe...',
        'Definitely!', 'Not sure.', 'Ask again later.', 'Looks promising!'
    ];

    const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
    reply(`🎱 *Magic 8-Ball says:* ${randomAnswer}`);
});


// --- Compliment Command ---
cmd({
    pattern: 'compliment',
    desc: 'Give a nice compliment',
    category: 'fun',
    filename: __filename,
    use: '@tag (optional)'
}, async (sock, m, message, { reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '😊', key: message.key } });
    
    // A collection of nice compliments
    const compliments = [
        "You're amazing just the way you are! 💖",
        "Your smile is contagious! 😊",
        // ... (and many others)
    ];

    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    const senderName = '@' + m.sender.split('@')[0];
    const taggedUserJid = message.mentionedJid[0] || (m.quoted && m.quoted.sender);
    const taggedUserName = taggedUserJid ? '@' + taggedUserJid.split('@')[0] : '';
    
    const responseText = taggedUserJid
        ? `${senderName} complimented ${taggedUserName}:\n😊 *${randomCompliment}*`
        : `${senderName}, you forgot to tag someone! But hey, here's a compliment for you:\n😊 *${randomCompliment}*`;

    await sock.sendMessage(m.chat, { text: responseText, mentions: [m.sender, taggedUserJid].filter(Boolean) }, { quoted: m });
});


// --- Emoji Converter Command ---
cmd({
    pattern: 'emoji',
    desc: 'Convert text into emoji form.',
    category: 'fun',
    filename: __filename,
    use: '<text>'
}, async (sock, m, message, { args, q, reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '🙂', key: message.key } });
    try {
        const textToConvert = args.join(' ');
        
        // Mapping of characters to emojis
        const emojiMap = {
            'a': '🅰️', 'b': '🅱️', 'c': '🇨️', 'd': '🇩️', 'e': '🇪️', 'f': '🇫️', 'g': '🇬️', 'h': '🇭️',
            'i': '🇮️', 'j': '🇯️', 'k': '🇰️', 'l': '🇱️', 'm': '🇲️', 'n': '🇳️', 'o': '🅾️', 'p': '🇵️',
            'q': '🇶️', 'r': '🇷️', 's': '🇸️', 't': '🇹️', 'u': '🇺️', 'v': '🇻️', 'w': '🇼️', 'x': '🇽️',
            'y': '🇾️', 'z': '🇿️',
            '0': '0️⃣', '1': '1️⃣', '2': '2️⃣', '3': '3️⃣', '4': '4️⃣', '5': '5️⃣', '6': '6️⃣', '7': '7️⃣',
            '8': '8️⃣', '9': '9️⃣', ' ': '␣'
        };

        const convertedText = textToConvert.toLowerCase().split('').map(char => emojiMap[char] || char).join('');

        if (!textToConvert) {
            return reply('Please provide some text to convert into emojis!');
        }

        await sock.sendMessage(m.chat, { text: convertedText }, { quoted: m });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});
