const { cmd } = require('../command');
const { sleep } = require('../lib/functions');
const { exec } = require('child_process');

cmd({
    pattern: "restart",
    desc: "Restart QADEER-AI",
    category: "owner",
    filename: __filename
}, async (sock, buddy, m, { reply, isPatron }) => {

    await sock.sendMessage(m.message.remoteJid, { react: { text: '🔄', key: m.key } });

    if (!isPatron) {
        return reply("❌ Only group admins can use this command.");
    }

    await reply("*♻️ Restarting QADEER-AI...*");
    await sleep(1500); // 1.5 seconds

    setTimeout(() => {
        exec("pm2 restart QADEER-AI", (error, stdout, stderr) => {
            if (error) {
                console.log('exec error: ' + error);
                return reply('❌ Restart error: ' + error.message);
            }
            if (stderr) {
                console.log('stderr: ' + stderr);
                return reply('⚠️ stderr: ' + stderr);
            }
            console.log('stdout: ' + stdout);
        });
    }, 2000); // 2 seconds
});
