// Import required modules
const fetch = require('node-fetch');
const FormData = require('form-data');
const { cmd } = require('../command');

/**
 * Uploads an image buffer to catbox.moe.
 * @param {Buffer} imageBuffer - The image data to upload.
 * @returns {Promise<string>} A promise that resolves to the URL of the uploaded image.
 */
async function uploadToCatbox(imageBuffer) {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', imageBuffer, 'image.jpg');

    const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: form,
    });

    const responseText = await response.text();

    if (!responseText.startsWith('https://')) {
        throw new Error('❌ Error while uploading image to Catbox.');
    }
    return responseText.trim();
}

// Define the command details
cmd({
    pattern: 'hd',
    alias: ['remini', 'enhance'],
    desc: 'Enhance photo quality using AI (like Remini)',
    category: 'tools',
    filename: __filename,
    use: '.hd (reply to an image)',
}, async (conn, m, { from }) => { // Standard parameters
    try {
        await conn.sendMessage(from, {
            react: { text: '⏳', key: m.key }
        });

        const message = m.quoted || m;
        const mime = (message.msg || message).mimetype || '';

        if (!mime) {
            throw '📷 Please send or reply to an image first.';
        }

        if (!/image\/(jpe?g|png)/.test(mime)) {
            throw `❌ The format *${mime}* is not supported.`;
        }

        const imageBuffer = await message.download?.();
        if (!imageBuffer) {
            throw '❌ Failed to download the image.';
        }

        // 1. Upload the image to get a direct URL
        const imageUrl = await uploadToCatbox(imageBuffer);

        // 2. Call the image enhancement API
        const reminiApiUrl = `https://zenz.biz.id/tools/remini?url=${encodeURIComponent(imageUrl)}`;
        const reminiResponse = await fetch(reminiApiUrl);

        if (!reminiResponse.ok) {
            throw '❌ Error accessing the enhancement API.';
        }

        const reminiResult = await reminiResponse.json();

        if (!reminiResult.status || !reminiResult.result?.result_url) {
            throw '❌ Invalid response from the enhancement API.';
        }

        // 3. Fetch the final, enhanced image
        const finalImageResponse = await fetch(reminiResult.result.result_url);
        const finalImageBuffer = await finalImageResponse.buffer();

        if (!finalImageBuffer || finalImageBuffer.length === 0) {
            throw '❌ Failed to fetch the final enhanced image.';
        }

        // Send the enhanced image back
        await conn.sendMessage(from, {
            image: finalImageBuffer,
            caption: '✅ *Image enhanced successfully!*',
        }, { quoted: m });

    } catch (error) {
        await conn.sendMessage(from, {
            react: { text: '❌', key: m.key }
        });

        console.error("HD Command Error:", error);
        const errorMessage = typeof error === 'string' ? error : '❌ An error occurred. The API might be down.';
        
        // FIX: reply ko vv2 model par laya gaya
        await conn.sendMessage(from, { text: errorMessage }, { quoted: m });
    }
});
