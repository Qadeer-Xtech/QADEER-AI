const { cmd } = require('../command');
const { sleep } = require("../lib/functions");
const { exec } = require("child_process"); // Require ko upar le aaya gaya hai

cmd({
    pattern: "restart",
    desc: "Restart QADEER-AI (Requires PM2)",
    category: "owner",
    react: "🔄",
    filename: __filename
},
async (conn, m, { from, isOwner }) => { // Standard parameters
    try {
        if (!isOwner) { // isCreator ko isOwner se badla gaya
            return await conn.sendMessage(from, { text: "ᴏɴʟy ᴛʜᴇ ʙᴏᴛ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜꜱᴇ ᴛʜɪꜱ ᴄᴏᴍᴍᴀɴᴅ." }, { quoted: m });
        }

        // Pehle message bhejain, phir restart karein
        await conn.sendMessage(from, { text: "🔄 ǫᴀᴅᴇᴇʀ ᴀɪ ɪs ʀᴇꜱᴛᴀʀᴛɪɴɢ..." }, { quoted: m });
        await sleep(1500); // Thora waqfa taake message chala jaye
        
        exec("pm2 restart all", (error, stdout, stderr) => {
            if (error) {
                console.error(`Restart Error: ${error}`);
                conn.sendMessage(from, { text: `❌ Restart failed: ${error.message}` }, { quoted: m });
                return;
            }
            if (stderr) {
                console.error(`Restart Stderr: ${stderr}`);
                conn.sendMessage(from, { text: `❌ Restart failed with stderr: ${stderr}` }, { quoted: m });
                return;
            }
            // Success par koi message nahi bhejte kyunke process restart ho jata hai
            console.log(`Restart Stdout: ${stdout}`);
        });

    } catch (e) {
        console.error("Restart Command Error:", e);
        await conn.sendMessage(from, { text: `❌ An unexpected error occurred: ${e.message}` }, { quoted: m });
    }
});
