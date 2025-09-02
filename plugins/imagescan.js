// imagescan.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
    cmd
} = require('../command');

// Function to upload a file to Catbox with retries
async function uploadToCatbox(fileBuffer) {
    const maxRetries = 3;
    const timeout = 30000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const formData = new FormData();
            formData.append('reqtype', 'fileupload');
            formData.append('fileToUpload', fileBuffer, 'image.jpg');

            const response = await axios.post('https://catbox.moe/user/api.php', formData, {
                headers: formData.getHeaders(),
                timeout: timeout,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });

            if (!response.data) {
                throw new Error('Empty response from Catbox');
            }

            if (attempt > 1) {
                console.log(`Successfully uploaded on attempt ${attempt}`);
            }
            return response.data;

        } catch (error) {
            console.log(`Upload attempt ${attempt} failed: ${error.message}`);
            if (attempt === maxRetries) {
                throw new Error(`Failed to upload after ${maxRetries} attempts: ${error.message}`);
            }
            await new Promise(res => setTimeout(res, 3000)); // wait before retrying
        }
    }
}

// Function to scan an image using the API with retries
async function scanImage(imageUrl) {
    const maxRetries = 3;
    const timeout = 30000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const apiUrl = `https://apis.davidcyriltech.my.id/imgscan?url=${encodeURIComponent(imageUrl)}`;
            const response = await axios.get(apiUrl, {
                timeout: timeout
            });

            if (!response.data?.success) {
                throw new Error(response.data?.message || 'Failed to analyze image');
            }

            return response.data.result;

        } catch (error) {
            console.log(`Scan attempt ${attempt} failed: ${error.message}`);
            if (attempt === maxRetries) {
                throw new Error(`Failed to scan image after ${maxRetries} attempts: ${error.message}`);
            }
            await new Promise(res => setTimeout(res, 3000)); // wait before retrying
        }
    }
}


cmd({
    pattern: 'scan',
    alias: ['imgscan', 'imagescan'],
    desc: 'Scan an image using AI',
    category: 'ai',
    filename: __filename
}, async (bot, message, client, {
    reply,
    quoted
}) => {
    await bot.sendMessage(message.key.remoteJid, {
        react: {
            text: '🔍',
            key: message.key
        }
    });

    try {
        if (!client.quoted) {
            return reply('Please reply to an image file (JPEG/PNG)');
        }

        const messageType = client.quoted.mtype;
        if (messageType !== 'imageMessage') {
            return reply("Please make sure you're replying to an image file (JPEG/PNG)");
        }

        const mimetype = client.quoted.mimetype || '';
        const imageBuffer = await client.quoted.download();

        const extension = mimetype.includes('jpeg') ? '.jpg' : mimetype.includes('png') ? '.png' : null;
        if (!extension) {
            throw new Error('Unsupported image format. Please use JPEG or PNG');
        }

        // The temporary file creation might not be necessary if uploadToCatbox accepts a buffer directly
        // But following the original logic for now.
        const tempFilePath = path.join(os.tmpdir(), `imgscan_${Date.now()}${extension}`);
        fs.writeFileSync(tempFilePath, imageBuffer);

        const form = new FormData();
        form.append('fileToUpload', fs.createReadStream(tempFilePath), `image${extension}`);
        form.append('reqtype', 'fileupload');

        const imageUrl = await uploadToCatbox(imageBuffer);
        fs.unlinkSync(tempFilePath); // Clean up the temporary file

        await reply('🔄 Analyzing image...');

        const analysisResult = await scanImage(imageUrl);

        await reply(`🔍 *Image Analysis Results*\n\n${analysisResult}\n\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽* 🤖`);

    } catch (error) {
        console.error("Image Scan Error:", error);
        await reply(`❌ Error: ${error.message || error}`);
    }
});
