const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd } = require('../command');

cmd({
  pattern: 'autosticker_event', // <<< YEH LINE ADD KI GAYI HAI
  on: "body",
  fromMe: false,                // <<< YEH LINE BEHTARI KE LIYE HAI
  dontAddCommandList: true      // <<< YEH LINE ADD KI GAYI HAI
},
async (conn, mek, m, { from, body }) => {
    const filePath = path.join(__dirname, '../Qadeer/autosticker.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    for (const text in data) {
        if (body.toLowerCase() === text.toLowerCase()) {
            if (config.AUTO_STICKER === 'true') {
                const stickerPath = path.join(__dirname, '../Qadeer/autosticker', data[text]);

                if (fs.existsSync(stickerPath)) {
                    const stickerBuffer = fs.readFileSync(stickerPath);

                    await conn.sendMessage(from, {
                        sticker: stickerBuffer,
                        packname: '𝐐𝐀𝐃𝐄𝐄𝐑-𝐀𝐈',
                        author: '●'
                    }, { quoted: mek });
                } else {
                    console.warn(`Sticker not found: ${stickerPath}`);
                }
            }
        }
    }
});
