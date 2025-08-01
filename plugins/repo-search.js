const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "srepo",
  desc: "Fetch info about a GitHub repository.",
  category: "other",
  react: "📁",
  filename: __filename
}, async (conn, m, store, { from, args, reply }) => {
  try {
    const repoName = args.join(" ");
    if (!repoName) return reply("❗ Usage: .srepo owner/repo");

    const apiUrl = `https://api.github.com/repos/${repoName}`;
    const { data } = await axios.get(apiUrl);

    let msg = `*🔍 GitHub Repository Info:*\n\n`;
    msg += `📦 *Name*: ${data.name}\n`;
    msg += `🌐 *URL*: ${data.html_url}\n`;
    msg += `🧾 *Description*: ${data.description || "No description"}\n`;
    msg += `⭐ *Stars*: ${data.stargazers_count}\n`;
    msg += `🍴 *Forks*: ${data.forks_count}\n`;
    msg += `👤 *Owner*: ${data.owner.login}\n`;
    msg += `🗓️ *Created*: ${new Date(data.created_at).toLocaleDateString()}\n\n`;
    msg += `🔗 *𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*`;

    const fakeContact = {
      key: {
        participants: "0@s.whatsapp.net",
        remoteJid: "status@broadcast",
        fromMe: false,
        id: 'V1X-REPO-CHECK'
      },
      message: {
        contactMessage: {
          displayName: "GitHub Bot Verified",
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:GitHub Official\nORG:GitHub Inc.\nTEL;type=CELL;type=VOICE;waid=923070000000:+92 307 0000000\nEND:VCARD`
        }
      }
    };

    const contextInfo = {
      forwardingScore: 999,
      isForwarded: true,
      externalAdReply: {
        title: "GitHub Repository",
        body: "Search by QADEER-AI",
        thumbnailUrl: "https://qu.ax/Pusls.jpg",
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: true,
        sourceUrl: data.html_url
      },
      forwardedNewsletterMessageInfo: {
        newsletterJid: "120363345872435489@newsletter",
        newsletterName: "GitHub Verified",
        serverMessageId: "",
      }
    };

    await conn.sendMessage(from, { text: msg }, { quoted: fakeContact, contextInfo });
  } catch (error) {
    console.error("GitHub API Error:", error);
    return reply(`❌ Error: ${error.response?.data?.message || error.message}`);
  }
});
        
