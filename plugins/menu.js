const config = require('../config');
const moment = require('moment-timezone');
const { cmd, commands } = require('../command');
const axios = require('axios');

// Aapka toSmallCaps function yahan hona chahiye
function toSmallCaps(str) {
  const smallCaps = {
    A: 'ᴀ', B: 'ʙ', C: 'ᴄ', D: 'ᴅ', E: 'ᴇ', F: 'ғ', G: 'ɢ', H: 'ʜ',
    I: 'ɪ', J: 'ᴊ', K: 'ᴋ', L: 'ʟ', M: 'ᴍ', N: 'ɴ', O: 'ᴏ', P: 'ᴘ',
    Q: 'ǫ', R: 'ʀ', S: 's', T: 'ᴛ', U: 'ᴜ', V: 'ᴠ', W: 'ᴡ', X: 'x',
    Y: 'ʏ', Z: 'ᴢ'
  };
  return str.toUpperCase().split('').map(c => smallCaps[c] || c).join('');
}


// ----------------- Pehli Command: `menu2` jisme teen buttons honge -----------------
cmd({
  pattern: "menu2",
  alias: ["buttons", "mainmenu"],
  use: '.menu2',
  desc: "Show main menu with buttons",
  category: "main",
  react: "⚙️",
  filename: __filename
},
async (conn, mek, m, { from, reply, sender }) => {
  try {
    const buttons = [
      {
        buttonId: 'all_menu',
        buttonText: { displayText: '📜 All Menu' },
        type: 1
      },
      {
        buttonId: 'owner_info',
        buttonText: { displayText: '👨‍💼 Owner' },
        type: 1
      },
      {
        buttonId: 'ping_test',
        buttonText: { displayText: '⚡ Ping' },
        type: 1
      }
    ];

    const buttonMessage = {
      text: "*Assalam-o-Alaikum! Welcome to QADEER-AI.*\n\nPlease select an option from below:",
      footer: "*Created with ❤️ by Qadeer Khan*",
      buttons: buttons,
      headerType: 1
    };

    await conn.sendMessage(from, buttonMessage, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message}`);
  }
});


// ----------------- Doosri Command: `handle_button` jo button clicks ko handle karegi -----------------
cmd({
  pattern: "handle_button",
  noCommand: true,
  alias: [],
  desc: "Handles button clicks",
  category: "main",
  filename: __filename
},
async (conn, mek, m, { from, reply, sender }) => {
  try {
    const buttonId = mek.selectedButtonId;

    if (!buttonId) return;

    switch (buttonId) {
      case 'all_menu':
        // Jab user 'All Menu' button dabaye, to categories buttons show karen
        const categories = {};
        for (let cmd of commands) {
            if (!cmd.category) continue;
            if (!categories[cmd.category]) categories[cmd.category] = [];
            categories[cmd.category].push(cmd);
        }

        const categoryKeys = Object.keys(categories).sort();
        const categoryButtons = categoryKeys.map(k => ({
            buttonId: `show_category_${k}`,
            buttonText: { displayText: `✨ ${k.toUpperCase()} Commands` },
            type: 1
        }));

        // Naye buttons ke saath message banayen
        const allMenuMessage = {
            text: "*✨ All Commands Menu ✨*\n\n_Please select a category below to view its commands._\nTo go back, type .menu2",
            footer: "*Powered by Qadeer Khan*",
            buttons: categoryButtons,
            headerType: 1
        };

        await conn.sendMessage(from, allMenuMessage, { quoted: mek });
        break;

      case 'owner_info':
        // 'Owner' button dabane par aapke diye gaye code ko yahan istemaal karen
        const ownerNumber = config.OWNER_NUMBER;
        const ownerName = config.OWNER_NAME;
        const vcard = 'BEGIN:VCARD\n' +
                      'VERSION:3.0\n' +
                      `FN:Qadeer_Khan Creator\n` +
                      `TEL;type=CELL;type=VOICE;waid=${ownerNumber.replace('+', '')}:${ownerNumber}\n` +
                      'END:VCARD';

        await conn.sendMessage(from, { contacts: { displayName: ownerName, contacts: [{ vcard }] } });

        await conn.sendMessage(from, {
            image: { url: 'https://qu.ax/Pusls.jpg' },
            caption: `╭━━〔 𝐐𝐀𝐃𝐄𝐄𝐑-𝐀𝐈 〕━━┈⊷
┃◈╭─────────────·๏
┃◈┃• *Here is the owner details*
┃◈┃• *Name* - ${ownerName}
┃◈┃• *Number* ${ownerNumber}
┃◈┃• *Version*: 4.0.0 Global
┃◈└───────────┈⊷
╰──────────────┈⊷
> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ ǫᴀᴅᴇᴇʀ ᴋʜᴀɴ*`,
            contextInfo: {
                mentionedJid: [`${ownerNumber.replace('+', '')}@s.whatsapp.net`],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363345872435489@newsletter',
                    newsletterName: '𝐐𝐀𝐃ᴇᴇʀ-AI',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });
        break;

      case 'ping_test':
        // 'Ping' button dabane par aapke diye gaye code ko yahan istemaal karen
        const start = Date.now();
        await conn.sendMessage(from, {
            react: { text: '⚡', key: mek.key }
        });
        const message = await conn.sendMessage(from, { text: '*_Testing Ping..._*' });
        const end = Date.now();
        const ping = end - start;
        await conn.sendMessage(from, {
            text: `*⚡ 𝐏๏፝֟ƞ̽g ${ping} ms 📶*`,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: false,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363345872435489@newsletter',
                    newsletterName: "𝐐𝐀𝐃ᴇᴇʀ-AI",
                    serverMessageId: 143
                }
            }
        }, { quoted: message });
        break;

      default:
        // Yahan har category button ka response handle hoga
        if (buttonId.startsWith('show_category_')) {
          const categoryName = buttonId.replace('show_category_', '');
          let categoryMenu = `* Commands for ${categoryName.toUpperCase()} *\n\n`;

          const categoryCommands = commands.filter(c => c.category === categoryName);
          categoryCommands.forEach((cmd) => {
            const usage = cmd.pattern.split('|')[0];
            categoryMenu += `➤ ${config.PREFIX}${toSmallCaps(usage)}\n`;
            categoryMenu += `_Description:_ ${cmd.desc}\n\n`;
          });
          
          categoryMenu += `\n*To view all categories again, type .menu2*`;

          await conn.sendMessage(from, { text: categoryMenu }, { quoted: mek });
        } else {
            await conn.sendMessage(from, { text: "Invalid selection. Please try again." }, { quoted: mek });
        }
        break;
    }

  } catch (e) {
    console.error(e);
    reply(`❌ Error: ${e.message}`);
  }
});
