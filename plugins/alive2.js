const fs = require('fs');
const path = require('path');
const config = require('../config');
const {
    cmd
} = require('../command');

const ALIVE2_JSON = path.join(__dirname, '../lib/alive2.json');

// Function to read settings from the JSON file
function getAlive2Settings() {
    if (fs.existsSync(ALIVE2_JSON)) {
        try {
            return JSON.parse(fs.readFileSync(ALIVE2_JSON, 'utf8'));
        } catch {
            return null; // Return null if JSON is invalid
        }
    }
    return null; // Return null if file doesn't exist
}

// Function to write settings to the JSON file
function setAlive2Settings(imageUrl, message) {
    fs.writeFileSync(ALIVE2_JSON, JSON.stringify({
        'img': imageUrl,
        'msg': message
    }, null, 2));
}

// Command: .alive2
cmd({
    pattern: 'alive2',
    desc: 'Check bot online or no.',
    category: 'main',
    filename: __filename
}, async (sock, m, store, {
    from,
    reply
}) => {
    const settings = getAlive2Settings();

    if (!settings || !settings.img || !settings.msg) {
        return reply(
            'Alive2 message/image not set yet! Use .setalive <image/video_url> | <caption> to set it.\n' +
            'Example: .setalive https://example.com/image.jpg | Hello, I am alive! 🌟\n' +
            'Use .tourl to turn your picture to url'
        );
    }

    try {
        await sock.sendMessage(store.key.remoteJid, {
            react: {
                text: '🌐',
                key: store.key
            }
        });

        const {
            runtime
        } = require('../lib/functions');
        const botRuntime = runtime(process.uptime());
        const caption = settings.msg.replace(/\{runtime\}/gi, botRuntime);
        const mediaUrl = settings.img;
        const isVideo = /\.(mp4|mov|webm|mkv)$/i.test(mediaUrl);

        const messageOptions = isVideo ?
            {
                video: {
                    url: mediaUrl
                },
                caption: caption
            } :
            {
                image: {
                    url: mediaUrl
                },
                caption: caption
            };

        return await sock.sendMessage(from, messageOptions, {
            quoted: m
        });

    } catch (error) {
        console.log(error);
        reply('' + error);
    }
});

// Command: .setalive
cmd({
    pattern: 'setalive',
    desc: 'Set the alive2 image and message. Usage: .setalive <image/video_url> | <caption>',
    category: 'main',
    filename: __filename
}, async (sock, m, store, {
    from,
    args,
    isOwner,
    reply
}) => {
    if (!isOwner) {
        return reply('Only the bot owner can use this command!');
    }

    const text = args.join(' ');
    if (!text.includes('|')) {
        return reply(
            'Usage: .setalive <image/video_url> | <caption>\n' +
            'Use .tourl to turn your picture to url\n\n' +
            'Use {runtime} to display runtime in the caption'
        );
    }

    const [imageUrl, ...captionParts] = text.split('|');
    const caption = captionParts.join('|').trim();

    if (!imageUrl.trim() || !caption) {
        return reply(
            'Usage: .setalive <image/video_url> | <caption>\n' +
            'Use .tourl to turn your picture to url\n\n' +
            'Use {runtime} to display runtime in the caption'
        );
    }

    setAlive2Settings(imageUrl.trim(), caption);
    reply('Alive2 image and message updated!\nUse .alive2 to see it');
});
