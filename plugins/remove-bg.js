const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { cmd } = require('../command');

cmd({
    pattern: "removebg",
    alias: ["rmbg", "nobg", "transparentbg"],
    desc: "Remove background from an image",
    category: "utility",
    use: ".removebg [reply to image]",
    filename: __filename
}, async (sock, buddy, m, { reply, quoted }) => {

    await sock.sendMessage(m.key.remoteJid, { react: { text: '⏳', key: m.key } });

    try {
        if (!m.quoted) {
            return reply("Please reply to an image file (JPEG/PNG)");
        }

        const mimeType = m.quoted.mtype;
        if (mimeType !== "imageMessage") {
            return reply("Please make sure you're replying to an image file (JPEG/PNG)");
        }

        const messageType = m.quoted.mimetype || '';
        const imageBuffer = await m.quoted.download();

        let fileExtension = '';
        if (messageType.includes("image/jpeg")) {
            fileExtension = '.jpg';
        } else if (messageType.includes("image/png")) {
            fileExtension = '.png';
        } else {
            return reply("Unsupported image format. Please use JPEG or PNG");
        }

        // Save the image temporarily
        const tempFilePath = path.join(os.tmpdir(), `removebg_${Date.now()}${fileExtension}`);
        fs.writeFileSync(tempFilePath, imageBuffer);

        // Upload to Catbox to get a direct URL
        const form = new FormData();
        form.append('reqtype', 'fileupload');
        form.append('fileToUpload', fs.createReadStream(tempFilePath), `image${fileExtension}`);
        
        const catboxResponse = await axios.post('https://catbox.moe/user/api.php', form, {
            headers: form.getHeaders()
        });
        const imageUrl = catboxResponse.data;
        fs.unlinkSync(tempFilePath); // Delete temp file after upload

        if (!imageUrl) {
            throw "Failed to upload image to Catbox";
        }

        // Call the background removal API with the image URL
        const removeBgApiUrl = `https://apis.davidcyriltech.my.id/removebg?url=${encodeURIComponent(imageUrl)}`;
        const resultResponse = await axios.get(removeBgApiUrl, { responseType: 'arraybuffer' });

        if (!resultResponse.data || resultResponse.data.length < 100) {
            throw "API returned invalid image data";
        }
        
        // Save the result image and send it
        const resultFilePath = path.join(os.tmpdir(), `removebg_output_${Date.now()}.png`);
        fs.writeFileSync(resultFilePath, resultResponse.data);

        await sock.sendMessage(buddy.chat, {
            image: fs.readFileSync(resultFilePath),
            caption: "Background removed successfully! QADEER-AI"
        }, { quoted: buddy });

        fs.unlinkSync(resultFilePath); // Clean up the final image file

    } catch (error) {
        console.error("RemoveBG Error:", error);
        await reply(`❌ Error: ${error.message || error}`);
    }
});
