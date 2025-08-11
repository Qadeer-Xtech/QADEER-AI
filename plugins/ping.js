const config = require('../config');
const { cmd } = require('../command');
const os = require("os");
const { runtime } = require('../lib/functions'); // Assuming runtime function exists

cmd({
    pattern: "ping",
    alias: ["speed", "pong"],
    desc: "Check bot's response speed with a branded design.",
    category: "main",
    filename: __filename
},
async (conn, m, { from, sender }) => {
    try {
        // React to the message to show it's being processed
        await conn.sendMessage(from, {
            react: { text: "📟", key: m.key }
        });

        const start = new Date();
        // A small operation to measure latency more accurately
        await conn.getBusinessProfile(sender);
        const end = new Date();
        const latency = end - start;

        // Get current time and date
        const time = new Date().toLocaleTimeString("en-US", { timeZone: "Asia/Karachi", hour12: true });
        const date = new Date().toLocaleDateString("en-GB", { timeZone: "Asia/Karachi" });

        // Get system information
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memUsage = `${(usedMem / 1024 / 1024).toFixed(2)} MB / ${(totalMem / 1024 / 1024).toFixed(2)} MB`;

        const caption = `╭───⭓ *QADEER-AI STATUS* ⭓───╮
┃
┃   *│* *Ping:* ${latency} ms
┃   *│* *Runtime:* ${runtime(process.uptime())}
┃   *│* *Time:* ${time}
┃   *│* *Date:* ${date}
┃   *│* *Memory:* ${memUsage}
┃
╰─────────────────⎔`;

        await conn.sendMessage(from, {
            image: { url: 'https://telegra.ph/file/2e389753c73f30999be75.jpg' },
            caption: caption,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                externalAdReply: {
                    title: "QADEER-AI | Server Speed Test",
                    body: `Response in ${latency}ms`,
                    thumbnail: { url: 'https://telegra.ph/file/9919f8564889c19e59cee.jpg' },
                    sourceUrl: `https://wa.me/${config.OWNER_NUMBER}`,
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m });

    } catch (e) {
        console.error("Ping error:", e);
        const errorText = `❌ An error occurred while checking the ping.`;
        await conn.sendMessage(from, { text: errorText }, { quoted: m });
    }
});
