const { cmd } = require('../command');
const moment = require('moment-timezone');

cmd({
  pattern: "uptime",
  alias: ["up"],
  desc: "Check how long the bot has been online.",
  category: "system",
  filename: __filename,
}, async (Void, m, text) => {
  const runtime = () => {
    let seconds = process.uptime();
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const fakeContact = {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast"
    },
    message: {
      contactMessage: {
        displayName: "QADEERKHAN | QADEER-AI",
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:QADEERAI | QADEER-AI\nORG:QADEERKHAN;\nTEL;type=CELL;type=VOICE;waid=923070000000:+92 307 0000000\nEND:VCARD`,
        jpegThumbnail: Buffer.alloc(0)
      }
    }
  };

  const uptimeText = `*🤖 QADEER-AI Bot Uptime:*\n🕒 ${runtime()}\n\n💡 The bot has been running without interruption.`;

  await Void.sendMessage(m.chat, {
    text: uptimeText,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363345872435489@newsletter",
        newsletterName: "QADEER-AI Official"
      },
      externalAdReply: {
        title: "QADEER-AI",
        body: "𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽",
        thumbnailUrl: "https://qu.ax/Pusls.jpg",
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true,
        sourceUrl: "https://github.com/Qadeer-Xtech"
      }
    }
  }, { quoted: fakeContact });
});
