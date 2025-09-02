// emotions-tool.js

const { cmd } = require('../command');

/**
 * Helper function to create an editing animation.
 * @param {object} sock - The Baileys socket instance.
 * @param {string} from - The JID to send the message to.
 * @param {Array<string>} frames - An array of strings/emojis for the animation.
 * @param {number} interval - The time in milliseconds between edits.
 */
async function animateMessage(sock, from, frames, interval = 1000) {
    const sentMessage = await sock.sendMessage(from, { text: frames[0] });
    for (const frame of frames) {
        await new Promise(resolve => setTimeout(resolve, interval));
        await sock.relayMessage(from, {
            protocolMessage: {
                key: sentMessage.key,
                type: 14, // EDIT MESSAGE TYPE
                editedMessage: { conversation: frame }
            }
        }, {});
    }
}

// --- .happy command ---
cmd({
    pattern: 'happy',
    desc: 'Displays a dynamic edit msg for fun.',
    category: 'tools',
    filename: __filename
}, async (sock, m, message, { from, reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '😂', key: message.key } });
    try {
        const frames = ['😃', '😄', '😁', '😊', '😎', '🥳', '😸', '😹', '🌞', '🌈', '😃', '😄', '😁', '😊'];
        await animateMessage(sock, from, frames);
    } catch (error) {
        console.log(error);
        reply(`❌ *Error!* ${error.message}`);
    }
});

// --- .heart command ---
cmd({
    pattern: 'heart',
    desc: 'Displays a dynamic edit msg for fun.',
    category: 'tools',
    filename: __filename
}, async (sock, m, message, { from, reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '❤️', key: message.key } });
    try {
        const frames = ['💖', '💗', '💕', '🚹', '💛', '💚', '🚹', '💙', '🚹', '🚹', '🩶', '🤍', '🤎', '❤️‍🔥', '💞', '💓', '💘', '💝', '♥️', '💟', '❤️‍🩹', '❤️'];
        await animateMessage(sock, from, frames);
    } catch (error) {
        console.log(error);
        reply(`❌ *Error!* ${error.message}`);
    }
});

// --- .angry command ---
cmd({
    pattern: 'angry',
    desc: 'Displays a dynamic edit msg for fun.',
    category: 'tools',
    filename: __filename
}, async (sock, m, message, { from, reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '🤡', key: message.key } });
    try {
        const frames = ['😡', '😠', '🤬', '😤', '😾', '😡', '😠', '🤬', '😤', '😾'];
        await animateMessage(sock, from, frames);
    } catch (error) {
        console.log(error);
        reply(`❌ *Error!* ${error.message}`);
    }
});

// --- .sad command ---
cmd({
    pattern: 'sad',
    desc: 'Displays a dynamic edit msg for fun.',
    category: 'tools',
    filename: __filename
}, async (sock, m, message, { from, reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '😶', key: message.key } });
    try {
        const frames = ['🥺', '😟', '😕', '😖', '😫', '🙁', '😩', '😥', '😓', '😪', '😢', '😔', '😞', '😭', '💔', '😭', '😿'];
        await animateMessage(sock, from, frames);
    } catch (error) {
        console.log(error);
        reply(`❌ *Error!* ${error.message}`);
    }
});

// --- .shy command ---
cmd({
    pattern: 'shy',
    desc: 'Displays a dynamic edit msg for fun.',
    category: 'tools',
    filename: __filename
}, async (sock, m, message, { from, reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '🧐', key: message.key } });
    try {
        const frames = ['😳', '😊', '😶', '🙈', '🙊', '😳', '😊', '😶', '🙈', '🙊'];
        await animateMessage(sock, from, frames);
    } catch (error) {
        console.log(error);
        reply(`❌ *Error!* ${error.message}`);
    }
});

// --- .moon command ---
cmd({
    pattern: 'moon',
    desc: 'Displays a dynamic edit msg for fun.',
    category: 'tools',
    filename: __filename
}, async (sock, m, message, { from, reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '🌚', key: message.key } });
    try {
        const frames = ['🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌝🌚'];
        await animateMessage(sock, from, frames);
    } catch (error) {
        console.log(error);
        reply(`❌ *Error!* ${error.message}`);
    }
});

// --- .confused command ---
cmd({
    pattern: 'confused',
    desc: 'Displays a dynamic edit msg for fun.',
    category: 'tools',
    filename: __filename
}, async (sock, m, message, { from, reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '🤔', key: message.key } });
    try {
        const frames = ['😕', '😟', '😵', '🤔', '😖', '😲', '😦', '🤷', '🤷‍♂️', '🤷‍♀️'];
        await animateMessage(sock, from, frames);
    } catch (error) {
        console.log(error);
        reply(`❌ *Error!* ${error.message}`);
    }
});

// --- .hot command ---
cmd({
    pattern: 'hot',
    desc: 'Displays a dynamic edit msg for fun.',
    category: 'tools',
    filename: __filename
}, async (sock, m, message, { from, reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '💋', key: message.key } });
    try {
        const frames = ['🥵', '❤️', '💋', '😫', '🤤', '😋', '🥵', '🥶', '🙊', '😻', '🙈', '💋', '🫂', '🫀', '👅', '👄', '💋'];
        await animateMessage(sock, from, frames);
    } catch (error) {
        console.log(error);
        reply(`❌ *Error!* ${error.message}`);
    }
});

// --- .nikal command (ASCII art animation) ---
cmd({
    pattern: 'nikal',
    desc: 'Displays a dynamic edit msg for fun.',
    category: 'tools',
    filename: __filename
}, async (sock, m, message, { from, reply }) => {
    await sock.sendMessage(message.key.remoteJid, { react: { text: '🗿', key: message.key } });
    try {
        const frame1 = `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀⠀⠀⠀⠀⠀  ⠀ ⢳⡀⠀⡏⠀⠀⠀⠀  ⠀ ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀    ⣧⠀⢸           ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲      ⣿   ⣸    Nikal    ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱         ⣿   ⢹              ⡇\n  ⠙⢿⣯⠄⠀⠀⠀__   ⠀      ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀     ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀   ⣄⢸⠀⠀⠀⠀⠀⠀`;
        const frame2 = `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏⠀⠀⠀⠀⠀⠀⠀  ⠀ ⢳⡀⠀⡏⠀⠀⠀⠀  ⠀ ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀    ⣧⠀⢸           ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲      ⣿   ⣸    Lavde    ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱         ⣿   ⢹              ⡇\n  ⠙⢿⣯⠄⠀⠀|__|⠀⠀     ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀     ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀   ⣄⢸⠀⠀⠀⠀⠀⠀\``;
        const frame3 = `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏             ⢳⡀⠀⡏          ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀    ⣧⠀⢸            ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲      ⣿   ⣸    Pehli    ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱       ⣿   ⢹              ⡇\n  ⠙⢿⣯⠄⠀⠀(P)⠀⠀      ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀     ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀   ⣄⢸⠀⠀⠀⠀⠀⠀\``;
        const frame4 = `⠀⠀⠀⣠⣶⡾⠏⠉⠙⠳⢦⡀⠀⠀⠀⢠⠞⠉⠙⠲⡀⠀\n ⠀⣴⠿⠏           ⢳⡀⠀⡏          ⢷\n⢠⣟⣋⡀⢀⣀⣀⡀⠀⣀⡀    ⣧⠀⢸           ⡇\n⢸⣯⡭⠁⠸⣛⣟⠆⡴⣻⡲      ⣿   ⣸ Fursat   ⡇\n ⣟⣿⡭⠀⠀⠀⠀⠀⢱          ⣿   ⢹              ⡇\n  ⠙⢿⣯⠄⠀⠀⠀__   ⠀      ⡿ ⠀⡇⠀⠀⠀⠀    ⡼\n⠀⠀⠀⠹⣶⠆⠀⠀⠀⠀⠀⡴⠃⠀     ⠘⠤⣄⣠⠞⠀\n⠀⠀⠀⠀⢸⣷⡦⢤⡤⢤⣞⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n⠀⢀⣤⣴⣿⣏⠁⠀⠀⠸⣏⢯⣷⣖⣦⡀⠀⠀⠀⠀⠀⠀\n⢀⣾⣽⣿⣿⣿⣿⠛⢲⣶⣾⢉⡷⣿⣿⠵⣿⠀⠀⠀⠀⠀⠀\n⣼⣿⠍⠉⣿⡭⠉⠙⢺⣇⣼⡏⠀⠀   ⣄⢸⠀`;
        
        const frames = [frame1, frame2, frame3, frame4];
        await animateMessage(sock, from, frames, 500); // 500ms interval for faster animation
        
    } catch (error) {
        console.log(error);
        reply(`❌ *Error!* ${error.message}`);
    }
});
