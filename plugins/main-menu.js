const config = require('../config');
const moment = require('moment-timezone');
const { cmd, commands } = require('../command');
const axios = require('axios');

function toSmallCaps(str) {
  const smallCaps = {
    A: 'ᴀ', B: 'ʙ', C: 'ᴄ', D: 'ᴅ', E: 'ᴇ', F: 'ғ', G: 'ɢ', H: 'ʜ',
    I: 'ɪ', J: 'ᴊ', K: 'ᴋ', L: 'ʟ', M: 'ᴍ', N: 'ɴ', O: 'ᴏ', P: 'ᴘ',
    Q: 'ǫ', R: 'ʀ', S: 's', T: 'ᴛ', U: 'ᴜ', V: 'ᴠ', W: 'ᴡ', X: 'x',
    Y: 'ʏ', Z: 'ᴢ'
  };
  return str.toUpperCase().split('').map(c => smallCaps[c] || c).join('');
}

cmd({
  pattern: "menu",
  alias: ["❄️", "mega", "allmenu"],
  use: '.menu',
  desc: "Show all bot commands",
  category: "main",
  react: "❄️",
  filename: __filename
},
// GHALATI YAHAN THI, AB THEEK KAR DI GAYI HAI
async (dyby, mek, m, { from, reply, sender }) => { // <--- PEHLI TABDEELI YAHAN
  try {
    const totalCommands = commands.length;
    const date = moment().tz("Asia/Karachi").format("dddd, DD MMMM YYYY");

    const uptime = () => {
      let sec = process.uptime();
      let h = Math.floor(sec / 3600);
      let m = Math.floor((sec % 3600) / 60);
      let s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    };

    let dybymenu = `
*╭══〘 𝐐𝐀𝐃𝐄𝐄𝐑-𝐀𝐈 〙*
*┃❍* *ᴜsᴇʀ* : @${sender.split("@")[0]}
*┃❍* *ʀᴜɴᴛɪᴍᴇ* : ${uptime()}
*┃❍* *ᴍᴏᴅᴇ* : *${config.MODE}*
*┃❍* *ᴘʀᴇғɪx* : [${config.PREFIX}]
*┃❍* *ᴩʟᴜɢɪɴ* :  ${totalCommands}
*┃❍* *ᴅᴇᴠ* : *𝐐𝐚𝐝𝐞𝐞𝐫 𝐊𝐡𝐚𝐧*
*┃❍* *ᴠᴇʀsɪᴏɴs* : *4.0.0*
*╰════════════════⊷*`;
    let category = {};
    for (let cmd of commands) {
      if (!cmd.category) continue;
      if (!category[cmd.category]) category[cmd.category] = [];
      category[cmd.category].push(cmd);
    }

    const keys = Object.keys(category).sort();
    for (let k of keys) {
      dybymenu += `\n\n┌── 『 ${k.toUpperCase()} MENU 』`;
      const cmds = category[k].filter(c => c.pattern).sort((a, b) => a.pattern.localeCompare(b.pattern));
      cmds.forEach((cmd) => {
        const usage = cmd.pattern.split('|')[0];
        dybymenu += `\n├❃ ${config.PREFIX}${toSmallCaps(usage)}`;
      });
  dybymenu += `\n┗━━━━━━━━━━━━━━❃`;
    }

    dybymenu += `\n`;
    
await dyby.sendMessage(from, {
      image: { url: config.MENU_IMAGE_URL },
      caption: dybymenu,
      contextInfo: {
        mentionedJid: [sender], // Yahan bhi m.sender ki jagah sender istemal karna behtar hai
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
    console.error(e);
    reply(`❌ Error: ${e.message}`);
  }
});
