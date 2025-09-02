// tool-new.js
const { sleep } = require('../lib/functions');
const { cmd } = require('../command');

// Generate Random Color
cmd({
    pattern: 'rcolor',
    desc: 'Generate a random color with name and code.',
    category: 'utility',
    filename: __filename
}, async (client, message, m, { reply }) => {
    try {
        const colors = [
            "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Brown", "Black",
            "White", "Gray", "Cyan", "Magenta", "Lime", "Maroon", "Navy", "Olive", "Teal",
            "Turquoise", "Violet", "Indigo", "Lavender"
        ];
        const randomColorCode = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
        const randomColorName = colors[Math.floor(Math.random() * colors.length)];
        reply(`🎨 *Random Color:*\nName: ${randomColorName}\nCode: ${randomColorCode}`);
    } catch (error) {
        console.error('Error in .randomcolor command:', error);
        reply('❌ An error occurred while generating the random color.');
    }
});

// Text to Binary
cmd({
    pattern: 'binary',
    desc: 'Convert text into binary format.',
    category: 'utility',
    filename: __filename
}, async (client, message, m, { args, reply }) => {
    try {
        if (!args.length) {
            return reply('❌ Please provide the text to convert to binary.');
        }
        const text = args.join(' ');
        const binary = text.split('').map(char => {
            return ('00000000' + char.charCodeAt(0).toString(2)).slice(-8);
        }).join(' ');
        reply(`🔑 *Binary Representation:*\n${binary}`);
    } catch (error) {
        console.error('Error in .binary command:', error);
        reply('❌ An error occurred while converting to binary.');
    }
});

// Binary to Text
cmd({
    pattern: 'dbinary',
    desc: 'Decode binary string into text.',
    category: 'utility',
    filename: __filename
}, async (client, message, m, { args, reply }) => {
    try {
        if (!args.length) {
            return reply('❌ Please provide the binary string to decode.');
        }
        const binaryString = args.join(' ');
        const text = binaryString.split(' ').map(bin => {
            return String.fromCharCode(parseInt(bin, 2));
        }).join('');
        reply(`🔓 *Decoded Text:*\n${text}`);
    } catch (error) {
        console.error('Error in .binarydecode command:', error);
        reply('❌ An error occurred while decoding the binary string.');
    }
});

// Base64 Encode
cmd({
    pattern: 'base64',
    desc: 'Encode text into Base64 format.',
    category: 'utility',
    filename: __filename
}, async (client, message, m, { args, reply }) => {
    try {
        if (!args.length) {
            return reply('❌ Please provide the text to encode into Base64.');
        }
        const text = args.join(' ');
        const encoded = Buffer.from(text).toString('base64');
        reply(`🔑 *Encoded Base64 Text:*\n${encoded}`);
    } catch (error) {
        console.error('Error in .base64 command:', error);
        reply('❌ An error occurred while encoding the text into Base64.');
    }
});

// Base64 Decode
cmd({
    pattern: 'unbase64',
    desc: 'Decode Base64 encoded text.',
    category: 'utility',
    filename: __filename
}, async (client, message, m, { args, reply }) => {
    try {
        if (!args.length) {
            return reply('❌ Please provide the Base64 encoded text to decode.');
        }
        const base64String = args.join(' ');
        const decoded = Buffer.from(base64String, 'base64').toString('utf-8');
        reply(`🔓 *Decoded Text:*\n${decoded}`);
    } catch (error) {
        console.error('Error in .unbase64 command:', error);
        reply('❌ An error occurred while decoding the Base64 text.');
    }
});

// URL Encode
cmd({
    pattern: 'urlencode',
    desc: 'Encode text into URL encoding.',
    category: 'utility',
    filename: __filename
}, async (client, message, m, { args, reply }) => {
    try {
        if (!args.length) {
            return reply('❌ Please provide the text to encode into URL encoding.');
        }
        const text = args.join(' ');
        const encoded = encodeURIComponent(text);
        reply(`🔑 *Encoded URL Text:*\n${encoded}`);
    } catch (error) {
        console.error('Error in .urlencode command:', error);
        reply('❌ An error occurred while encoding the text.');
    }
});

// URL Decode
cmd({
    pattern: 'urldecode',
    desc: 'Decode URL encoded text.',
    category: 'utility',
    filename: __filename
}, async (client, message, m, { args, reply }) => {
    try {
        if (!args.length) {
            return reply('❌ Please provide the URL encoded text to decode.');
        }
        const urlString = args.join(' ');
        const decoded = decodeURIComponent(urlString);
        reply(`🔓 *Decoded Text:*\n${decoded}`);
    } catch (error) {
        console.error('Error in .urldecode command:', error);
        reply('❌ An error occurred while decoding the URL encoded text.');
    }
});

// Roll Dice
cmd({
    pattern: 'roll',
    desc: 'Roll a dice (1-6).',
    category: 'fun',
    filename: __filename
}, async (client, message, m, { reply }) => {
    try {
        const result = Math.floor(Math.random() * 6) + 1;
        reply(`🎲 You rolled: *${result}*`);
    } catch (error) {
        console.error('Error in .roll command:', error);
        reply('❌ An error occurred while rolling the dice.');
    }
});

// Coin Flip
cmd({
    pattern: 'coinflip',
    desc: 'Flip a coin and get Heads or Tails.',
    category: 'fun',
    filename: __filename
}, async (client, message, m, { reply }) => {
    try {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        reply(`🪙 Coin Flip Result: *${result}*`);
    } catch (error) {
        console.error('Error in .coinflip command:', error);
        reply('❌ An error occurred while flipping the coin.');
    }
});

// Flip Text
cmd({
    pattern: 'flip',
    desc: 'Flip the text you provide.',
    category: 'fun',
    filename: __filename
}, async (client, message, m, { args, reply }) => {
    try {
        if (!args.length) {
            return reply('❌ Please provide the text to flip.');
        }
        const text = args.join(' ');
        const flipped = text.split('').reverse().join('');
        reply(`🔄 Flipped Text: *${flipped}*`);
    } catch (error) {
        console.error('Error in .flip command:', error);
        reply('❌ An error occurred while flipping the text.');
    }
});

// Pick
cmd({
    pattern: 'pick',
    desc: 'Pick between two choices.',
    category: 'fun',
    filename: __filename
}, async (client, message, m, { args, reply }) => {
    try {
        if (args.length < 2) {
            return reply('❌ Please provide two choices to pick from. Example: `.pick Ice Cream, Pizza`');
        }
        const choice = args.join(' ').split(',')[Math.floor(Math.random() * 2)].trim();
        reply(`🎉 Bot picks: *${choice}*`);
    } catch (error) {
        console.error('Error in .pick command:', error);
        reply('An error occurred while processing the command. Please try again.');
    }
});

// Time Now
cmd({
    pattern: 'timenow',
    desc: 'Check the current local time.',
    category: 'utility',
    filename: __filename
}, async (client, message, m, { reply }) => {
    try {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'Asia/Karachi'
        });
        reply(`🕒 Current Local Time in Pakistan: ${timeString}`);
    } catch (error) {
        console.error('Error in .timenow command:', error);
        reply('❌ An error occurred while processing your request.');
    }
});

// Date
cmd({
    pattern: 'date',
    desc: 'Check the current date.',
    category: 'utility',
    filename: __filename
}, async (client, message, m, { reply }) => {
    try {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        reply(`📅 Current Date: ${dateString}`);
    } catch (error) {
        console.error('Error in .date command:', error);
        reply('❌ An error occurred while processing your request.');
    }
});

// Shapar (ASCII art mention)
cmd({
    pattern: 'shapar',
    desc: 'Send shapar ASCII art with mentions.',
    category: 'fun',
    filename: __filename
}, async (client, message, m, { from, isGroup, reply }) => {
    try {
        if (!isGroup) {
            return reply('This command can only be used in groups.');
        }
        const mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedJid) {
            return reply('Please mention a user to send the ASCII art to.');
        }
        const shaparArt = `       _______
     .-'       '-.
    /             /|
   /___________/ |
   |         |  |
   |   \\  \\   ||  |
   |    \\  \\  ||  |
   |____\\  \\ ||  |
   |'._  _.'||  |
   |  .' '.  ||  |
   | '.__.' ||  |
   |_________||  |
   '------------'  |
    \\_____________\\|`;
        const text = `😂 @${mentionedJid.split('@')[0]} that for you:\n\n${shaparArt}`;
        await client.sendMessage(from, { text: text, mentions: [mentionedJid] }, { quoted: m });
    } catch (error) {
        console.error('Error in .shapar command:', error);
        reply('❌ An error occurred while processing your request.');
    }
});

// Rate
cmd({
    pattern: 'rate',
    desc: 'Rate someone out of 10.',
    category: 'fun',
    filename: __filename
}, async (client, message, m, { from, isGroup, reply }) => {
    try {
        if (!isGroup) {
            return reply('This command can only be used in groups.');
        }
        const mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedJid) {
            return reply('Please mention someone to rate.');
        }
        const rating = Math.floor(Math.random() * 10) + 1;
        const text = `@${mentionedJid.split('@')[0]} is rated ${rating}/10.`;
        await client.sendMessage(from, { text: text, mentions: [mentionedJid] }, { quoted: m });
    } catch (error) {
        console.error('Error in .rate command:', error);
        reply('An error occurred. Please try again.');
    }
});

// Countdown (Descending)
cmd({
    pattern: 'count',
    desc: 'Start a reverse countdown from the specified number to 1.',
    category: 'owner',
    filename: __filename
}, async (client, message, m, { args, reply, senderNumber }) => {
    try {
        const ownerId = client.user.id.split(':')[0];
        const lid = client.user.lid ? client.user.lid.split(':')[0] : null;

        if (senderNumber !== ownerId && senderNumber !== lid) {
            return reply('❌ Only group admins can use this command.');
        }
        if (!args[0]) {
            return reply('✳️ Use this command like:\n *Example:* .count 10');
        }
        const countFrom = parseInt(args[0].trim());
        if (isNaN(countFrom) || countFrom <= 0 || countFrom > 50) {
            return reply('❎ Please specify a valid number between 1 and 50.');
        }

        reply(`⏳ Starting reverse countdown from ${countFrom}...`);
        for (let i = countFrom; i >= 1; i--) {
            await client.sendMessage(m.from, { text: '' + i }, { quoted: message });
            await sleep(1000);
        }
        reply('✅ Countdown completed.');
    } catch (error) {
        console.error(error);
        reply('❌ An error occurred. Please try again later.');
    }
});


// Countdown (Ascending)
cmd({
    pattern: 'countx',
    desc: 'Start a countdown from 1 to the specified number.',
    category: 'owner',
    filename: __filename
}, async (client, message, m, { args, reply, senderNumber }) => {
    try {
        const ownerId = client.user.id.split(':')[0];
        const lid = client.user.lid ? client.user.lid.split(':')[0] : null;
        if (senderNumber !== ownerId && senderNumber !== lid) {
            return reply('❌ Only group admins can use this command.');
        }
        if (!args[0]) {
            return reply('✳️ Use this command like:\n *Example:* .countx 10');
        }
        const countTo = parseInt(args[0].trim());
        if (isNaN(countTo) || countTo <= 0 || countTo > 50) {
            return reply('❎ Please specify a valid number between 1 and 50.');
        }
        reply(`⏳ Starting countdown to ${countTo}...`);
        for (let i = 1; i <= countTo; i++) {
            await client.sendMessage(m.from, { text: '' + i }, { quoted: message });
            await sleep(1000);
        }
        reply('✅ Countdown completed.');
    } catch (error) {
        console.error(error);
        reply('❌ An error occurred. Please try again later.');
    }
});
