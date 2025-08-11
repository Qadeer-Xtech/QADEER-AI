
const { cmd } = require('../command');
const { runtime } = require('../lib/functions');
const config = require('../config');
const pkg = require('../package.json');

cmd({
    pattern: "uptime",
    alias: ["runtime", "run"],
    desc: "Show bot uptime with stylish formats",
    category: "main",
    react: "⏱️",
    filename: __filename
},
async (conn, mek, m, { from, reply, args }) => {
    try {
        const uptime = runtime(process.uptime());
        const seconds = Math.floor(process.uptime());
        const startTime = new Date(Date.now() - seconds * 1000);
        const version = pkg.version || "2.0.0";

        const styles = [
`╭───『 UPTIME 』───⳹
│ ⏱️ ${uptime}
│ 🧭 ${seconds} seconds
│ 🚀 Started: ${startTime.toLocaleString()}
╰────────────────⳹
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ǫᴀᴅᴇᴇʀ ᴋʜᴀɴ*`,

`🅤🅟🅣🅘🅜🅔 🅢🅣🅢🅣🅤🅢
♢ Running: ${uptime}
♢ Seconds: ${seconds}
♢ Since: ${startTime.toLocaleDateString()}
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ǫᴀᴅᴇᴇʀ ᴋʜᴀɴ*`,

`┌──────────────────────┐
│  ⚡ UPTIME STATUS ⚡  
├─────────────────────
│ • Time: ${uptime}
│ • Seconds: ${seconds}
│ • Started: ${startTime.toLocaleString()}
│ • Version: ${version}
└──────────────────────┘`,

`▰▰▰▰▰ 🅤🅟🅣🅘🅜🅔 ▰▰▰▰▰
> ⏳ ${uptime}
> 🕰️ ${startTime.toLocaleString()}
> 🔢 ${seconds} seconds
> *𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*`,

`╔══════════════════════╗
║   𝐒𝐀𝐊𝐎𝐍𝐀𝟏-𝐌𝐃 UPTIME    
╠══════════════════════
║  RUNTIME: ${uptime}
║  SECONDS: ${seconds}
║  SINCE: ${startTime.toLocaleString()}
╚══════════════════════╝`,

`> ⏱️ *UᎮTIMᏋ ᎦTᏘTUᎦ* ⏱️
> 🟢 Online for: ${uptime}
> 🔢 Seconds: ${seconds}
> 📅 Since: ${startTime.toLocaleString()}
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ǫᴀᴅᴇᴇʀ ᴋʜᴀɴ*`,

`┏━━━━━━━━━━━━━━━━━━┓
┃  𝐐𝐀𝐃𝐄𝐄𝐑-𝐀𝐈  
┗━━━━━━━━━━━━━━━━━━┛
◈ Duration: ${uptime}
◈ Seconds: ${seconds}
◈ Start Time: ${startTime.toLocaleString()}
◈ Stability: 100%
◈ Version: ${version}
> *𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*`
        ];

        let selectedStyle;
        if (args[0] && args[0].toLowerCase().startsWith("style")) {
            const index = parseInt(args[0].replace("style", "")) - 1;
            if (!isNaN(index) && styles[index]) {
                selectedStyle = styles[index];
            } else {
                return reply(`❌ Style not found.\n✅ Use: style1 to style${styles.length}`);
            }
        } else {
            selectedStyle = styles[Math.floor(Math.random() * styles.length)];
        }

        await conn.sendMessage(from, {
            image: { url: 'https://qu.ax/Pusls.jpg' },
            caption: selectedStyle,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363345872435489@newsletter',
                    newsletterName: '𝐐𝐀𝐃𝐄𝐄𝐑-𝐀𝐈',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Uptime Error:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
