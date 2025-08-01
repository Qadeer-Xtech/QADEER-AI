const { cmd } = require('../command');
const moment = require('moment-timezone');
const { runtime } = require('../lib/functions');

cmd({
  pattern: "alive",
  desc: "Show bot is running",
  category: "system",
  filename: __filename
}, async (Void, m) => {
  let time = moment.tz('Asia/Karachi').format('HH:mm:ss');
  let date = moment.tz('Asia/Karachi').format('DD/MM/YYYY');
  let up = runtime(process.uptime());

  let message = `
╭────[ *⚙ QADEER-AI IS ALIVE ⚙* ]────╮
│
├ 🧿 *Time:* ${time}
├ 🗓 *Date:* ${date}
├ 💠 *Uptime:* ${up}
│
╰─⭓ *𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*
`.trim();

  let vcard = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      ...(m.chat ? { remoteJid: "status@broadcast" } : {})
    },
    message: {
      contactMessage: {
        displayName: "QADEER-AI",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:QADEER-AI\nORG:Verified Bot;\nTEL;type=CELL;type=VOICE;waid=923070000000:+923070000000\nEND:VCARD`
      }
    }
  };

  await Void.sendMessage(m.chat, { text: message }, {
    quoted: vcard,
    contextInfo: {
      externalAdReply: {
        title: "QADEER-AI WhatsApp Bot",
        body: "Alive & Running - 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽",
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false,
        sourceUrl: '',
      },
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363345872435489@newsletter",
        serverMessageId: "",
        newsletterName: "QADEER-AI Verified Bot"
      }
    }
  });
});
          
