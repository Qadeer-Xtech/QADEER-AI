const fs = require('fs');
const path = require('path');

module.exports = async (context) => {
    // Context se 'pict' hata diya kyunki ab hum direct file uthayenge
    const { client, m, prefix, botname } = context;

    if (!botname) {
        console.error(`Botname not set, you useless fuck.`);
        return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ Bot's fucked. No botname in context. Yell at your dev, dipshit.\n◈━━━━━━━━━━━━━━━━◈`);
    }

    // Path define kar rahe hain: Root Folder > ABBAS > alive.jpg
    const localImagePath = path.join(process.cwd(), 'ABBAS', 'alive.jpg');

    // Check karein agar photo wahan hai ya nahi
    if (!fs.existsSync(localImagePath)) {
        console.error(`[ALIVE-ERROR] Photo not found at: ${localImagePath}, you blind bat.`);
        return m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ No image found in ABBAS folder, you idiot.\n│❒ Put 'alive.jpg' in 'ABBAS' folder properly.\n◈━━━━━━━━━━━━━━━━◈`);
    }

    try {
        const caption = `◈━━━━━━━━━━━━━━━━◈\n│❒ Yo ${m.pushName}, *${botname}* is alive and ready to fuck shit up! 🖕\n│❒ \n│❒ Type *${prefix}menu* to see what I can do, you pathetic loser.\n◈━━━━━━━━━━━━━━━━◈\n│❒ Powered by *QADEER-AI*, 'cause you're too dumb to code`;

        console.log(`[ALIVE-DEBUG] Fetching image from: ${localImagePath}`);

        // Send the image directly from the ABBAS folder
        await client.sendMessage(m.chat, {
            image: { url: localImagePath }, // Direct path pass kar diya
            caption: caption,
            mentions: [m.sender]
        }, { quoted: m });

        // Audio file paths (Existing logic maintained)
        const possibleAudioPaths = [
            path.join(__dirname, 'QADEER-AI', 'test.mp3'),
            path.join(process.cwd(), 'QADEER-AI', 'test.mp3'),
            path.join(__dirname, '..', 'QADEER-AI', 'test.mp3'),
        ];

        let audioFound = false;
        for (const audioPath of possibleAudioPaths) {
            console.log(`[ALIVE-DEBUG] Checking audio path: ${audioPath}`);
            try {
                if (fs.existsSync(audioPath)) {
                    await client.sendMessage(m.chat, {
                        audio: { url: audioPath },
                        ptt: true,
                        mimetype: 'audio/mpeg',
                        fileName: 'fuck-you.mp3'
                    }, { quoted: m });
                    audioFound = true;
                    console.log(`[ALIVE-DEBUG] Sent audio from: ${audioPath}`);
                    break;
                } else {
                    console.log(`[ALIVE-DEBUG] Audio not found at: ${audioPath}`);
                }
            } catch (err) {
                console.error(`[ALIVE-ERROR] Failed to send audio from ${audioPath}: ${err.stack}`);
            }
        }

        if (!audioFound) {
            console.error('❌ Audio file not found at any path, you incompetent dev');
            await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ FUCK! ${m.pushName}, couldn't find the voice note.\n│❒ Check QADEER-AI/test.mp3, you worthless piece of shit.\n◈━━━━━━━━━━━━━━━━◈`);
        }

    } catch (error) {
        console.error(`[ALIVE-ERROR] ALIVE COMMAND CRASHED LIKE YOUR LIFE: ${error.stack}`);
        await m.reply(`◈━━━━━━━━━━━━━━━━◈\n│❒ SHIT BROKE, ${m.pushName}!\n│❒ Error: ${error.message}\n│❒ Try again when you grow a brain, loser.\n◈━━━━━━━━━━━━━━━━◈`);
    }
};
