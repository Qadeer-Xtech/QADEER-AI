const axios = require('axios');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');

cmd({
    pattern: 'checkupdate',
    alias: ['version', 'cupdate', 'info'],
    desc: "Check bot's version, system stats, and update info.",
    category: 'info',
    filename: __filename
}, async (sock, m, store, { from, sender, pushname, reply }) => {

    await sock.sendMessage(store.key.remoteJid, { react: { text: '🚀', key: store.key } });

    try {
        const versionFilePath = path.join(__dirname, '../data/version.json');
        let currentVersion = 'Unknown';
        let currentChangelog = 'No changelog available.';

        // Read local version info if it exists
        if (fs.existsSync(versionFilePath)) {
            const localVersionData = JSON.parse(fs.readFileSync(versionFilePath));
            currentVersion = localVersionData.version;
            currentChangelog = localVersionData.changelog;
        }

        const remoteVersionUrl = 'https://raw.githubusercontent.com/Qadeer-Xtech/QADEER-AI/main/data/version.json';
        let latestVersion = 'Unknown';
        let latestChangelog = 'No changelog available.';
        let updateMessage = '✅ Your QADEER-AI bot is up-to-date!';

        // Fetch remote version info from GitHub
        try {
            const { data: remoteVersionData } = await axios.get(remoteVersionUrl);
            latestVersion = remoteVersionData.version;
            latestChangelog = remoteVersionData.changelog;
        } catch (e) {
            console.error('Failed to fetch latest version:', e);
        }

        // Compare versions and set update message
        if (currentVersion !== latestVersion && latestVersion !== 'Unknown') {
            updateMessage = `🚀 Your QADEER-AI bot is outdated!\n🔹 *Current Version:* ${currentVersion}\n🔹 *Latest Version:* ${latestVersion}\n\nUse *.update* to update.`;
        }
        
        // System Information
        const pluginDir = path.join(__dirname, '../plugins');
        const pluginCount = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js')).length;
        const commandCount = commands.length;
        const uptime = runtime(process.uptime());
        const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalRam = (os.totalmem() / 1024 / 1024).toFixed(2);
        const hostName = os.hostname();
        const lastUpdateTime = fs.statSync(versionFilePath).mtime.toLocaleString();

        // Greeting message based on time of day
        const greeting = new Date().getHours() < 12 ? 'Morning' : 'Night';

        const caption = 
            `🌟 *Good ${greeting}, ${pushname}!* 🌟\n\n` +
            `📌 *Bot Name:* QADEER-AI\n` +
            `🔖 *Current Version:* ${currentVersion}\n` +
            `📢 *Latest Version:* ${latestVersion}\n` +
            `📂 *Total Plugins:* ${pluginCount}\n` +
            `🔢 *Total Commands:* ${commandCount}\n\n` +
            `💾 *System Info:*\n` +
            `⏳ *Uptime:* ${uptime}\n` +
            `📟 *RAM Usage:* ${ramUsed}MB / ${totalRam}MB\n` +
            `⚙️ *Host Name:* ${hostName}\n` +
            `📅 *Last Update:* ${lastUpdateTime}\n\n` +
            `📝 *Changelog:*\n${latestChangelog}\n\n` +
            `👤 *Owner:* [𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽](https://github.com/Qadeer-Xtech)\n\n` +
            `⭐ *GitHub Repo:* https://github.com/Qadeer-Xtech/QADEER-AI\n` +
            `🚀 *Hey! Don't forget to fork & star the repo!*\n\n` +
            `${updateMessage}`;

        await sock.sendMessage(from, {
            image: { url: 'https://qu.ax/Pusls.jpg' },
            caption: caption,
            contextInfo: {
                mentionedJid: [store.sender],
                forwardingScore: 2,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363345872435489@newsletter',
                    newsletterName: '𝚀𝙰𝙳𝙴𝙴𝚁_𝙺𝙷𝙰𝙽',
                    serverMessageId: 143
                }
            }
        }, { quoted: m });

    } catch (error) {
        console.error("Error fetching version info:", error);
        reply('❌ An error occurred while checking the bot version.');
    }
});
