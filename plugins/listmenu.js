const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const moment = require('moment-timezone');

cmd({
  pattern: "listmenu",
  alias: ["commandlist", "help"],
  desc: "Fetch and display all available bot commands",
  category: "system",
  filename: __filename,
}, async (Void, m, text) => { // removed { prefix } from params
  try {
    const commandDir = path.join(__dirname, '../plugins');
    const commandFiles = fs.readdirSync(commandDir).filter(file => file.endsWith('.js'));

    let totalCommands = 0;
    let commandList = [];

    for (const file of commandFiles) {
      const filePath = path.join(commandDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const matches = content.match(/pattern:\s*["'`](.*?)["'`]/g);
      
      if (matches) {
        const extracted = matches.map(x => x.split(':')[1].replace(/["'`,]/g, '').trim());
        totalCommands += extracted.length;
        commandList.push(`📁 *${file}*\n${extracted.map(cmd => `╰➤ \`${cmd}\``).join('\n')}`);
      }
    }

    const time = moment().tz('Asia/Karachi').format('HH:mm:ss');
    const date = moment().tz('Asia/Karachi').format('dddd, MMMM Do YYYY');

    const caption = `╭━━〔 *QADEER-AI Command List* 〕━━⬣
┃ 👑 *Total Commands:* ${totalCommands}
┃ 📅 *Date:* ${date}
┃ ⏰ *Time:* ${time}
╰━━━━━━━━━━━━━━━━━━━━⬣\n\n${commandList.join('\n\n')}`;

    await Void.sendMessage(m.chat, {
      image: { url: "https://qu.ax/Pusls.jpg" },
      caption,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363345872435489@newsletter",
          newsletterName: "QADEER-AI Official",
          serverMessageId: 2
        },
        externalAdReply: {
          title: "QADEER-AI Plugin List",
          body: `𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽`,
          mediaType: 1,
          sourceUrl: "https://github.com/Qadeer-Xtech/QADEER-AI",
          renderLargerThumbnail: false,
          showAdAttribution: true
        }
      }
    }, {
      quoted: {
        key: {
          fromMe: false,
          participant: '0@s.whatsapp.net',
          remoteJid: 'status@broadcast'
        },
        message: {
          contactMessage: {
            displayName: "QADEER-AI | 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽",
            vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:QADEER-AI | Qadeer-Xtech\nORG:Qadeer-Xtech;\nTEL;type=CELL;type=VOICE;waid=923070000000:+92 307 0000000\nEND:VCARD`,
            jpegThumbnail: Buffer.alloc(0)
          }
        }
      }
    });

  } catch (err) {
    console.error(err);
    await m.reply('❌ Error: Could not fetch the command list.');
  }
});
