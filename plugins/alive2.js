const fs = require('fs');
const path = require("path");
const { cmd } = require("../command");
const config = require('../config');

// JSON file ka path
const ALIVE2_JSON = path.join(__dirname, '../lib/alive2.json');

// Settings haasil karne ka function
function getAlive2Settings() {
    if (fs.existsSync(ALIVE2_JSON)) {
        try {
            return JSON.parse(fs.readFileSync(ALIVE2_JSON, "utf8"));
        } catch {
            return null;
        }
    }
    return null;
}

// Settings save karne ka function
function setAlive2Settings(img, msg) {
    fs.writeFileSync(ALIVE2_JSON, JSON.stringify({ img, msg }, null, 2), 'utf8');
}

// --- Command .alive2 ---
cmd({
    pattern: "alive2",
    desc: "Check bot online status with a custom message.",
    category: 'main',
    filename: __filename,
}, async (conn, m, { from }) => { // Standard parameters
    const settings = getAlive2Settings();

    // FIX: 'reply' ki jagah 'conn.sendMessage' aur backticks ka istemal
    if (!settings || !settings.img || !settings.msg) {
        const replyText = `*Alive2 message/image not set yet!*

*Use:* ${config.PREFIX}setalive <image/video_url> | <caption>
*Example:* ${config.PREFIX}setalive https://example.com/image.jpg | Hello, I am {runtime} old! 🌟`;
        
        return await conn.sendMessage(from, { text: replyText }, { quoted: m });
    }

    try {
        await conn.sendMessage(m.key.remoteJid, {
            react: { text: '🌐', key: m.key }
        });

        const runtimeText = require("../lib/functions").runtime(process.uptime());
        const msgText = settings.msg.replace(/\{runtime\}/gi, runtimeText);
        const mediaUrl = settings.img;
        const isVideo = /\.(mp4|mov|webm|mkv)$/i.test(mediaUrl);

        const content = isVideo
            ? { video: { url: mediaUrl }, caption: msgText }
            : { image: { url: mediaUrl }, caption: msgText };

        await conn.sendMessage(from, content, { quoted: m });
    } catch (err) {
        console.error("Alive2 Error:", err);
        await conn.sendMessage(from, { text: `An error occurred: ${err.message}` }, { quoted: m });
    }
});


// --- Command .setalive ---
cmd({
    pattern: "setalive",
    desc: "Set the alive2 image and message.",
    category: "owner",
    filename: __filename,
}, async (conn, m, { args, isOwner, from }) => { // Standard parameters
    if (!isOwner) {
        return await conn.sendMessage(from, { text: "❌ *Only the bot owner can use this command!*" }, { quoted: m });
    }

    const input = args.join(" ");

    // FIX: 'reply' ki jagah 'conn.sendMessage' aur backticks ka istemal
    if (!input.includes('|')) {
        const replyText = `❌ *Invalid format.*\n\n*Usage:* ${config.PREFIX}setalive <image/video_url> | <caption>\n\n*Example:* ${config.PREFIX}setalive https://i.imgur.com/image.jpeg | I am alive!\n\n_Use {runtime} in caption to show bot uptime._`;
        return await conn.sendMessage(from, { text: replyText }, { quoted: m });
    }

    const [url, ...captionParts] = input.split('|');
    const caption = captionParts.join('|').trim();

    if (!url.trim() || !caption) {
        const replyText = `❌ *Both URL and caption are required.*\n\n*Usage:* ${config.PREFIX}setalive <image/video_url> | <caption>`;
        return await conn.sendMessage(from, { text: replyText }, { quoted: m });
    }

    setAlive2Settings(url.trim(), caption);

    // FIX: 'reply' ki jagah 'conn.sendMessage' aur backticks ka istemal
    const replyText = `✅ *Alive2 message and image have been saved successfully!*\n\nUse ${config.PREFIX}alive2 to test it.`;
    await conn.sendMessage(from, { text: replyText }, { quoted: m });
});
