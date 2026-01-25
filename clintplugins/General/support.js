module.exports = async (context) => {
  const { client, m } = context;

  const message = `
╭━━〔 *Toxic-MD Support Links* 〕━━━━╮

> 👑 *Owner*  
https://wa.me/923151105391

> 📢 *Channel Link*  
https://whatsapp.com/channel/0029VajWxSZ96H4SyQLurV1H

> 👥 *Group*  
https://chat.whatsapp.com/J9ZOfMMCTzSLMKkpj0rdOz

╰━━━━━━━━━━━━━━━━━━━━━━━╯
> 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽
`;

  try {
    await client.sendMessage(
      m.chat,
      { text: message },
      { quoted: m }
    );
  } catch (error) {
    console.error("Support command error:", error);
    await m.reply("⚠️ Failed to send support links. Please try again.");
  }
};