// image-upscaler.js
const fetch = require('node-fetch');
const FormData = require('form-data');
const {
    cmd
} = require('../command');

// Function to upload an image buffer to Catbox
async function uploadToCatbox(imageBuffer) {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', imageBuffer, 'image.jpg'); // Provide a filename

    const response = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: formData,
    });

    const responseText = await response.text();
    if (!responseText.startsWith('https://')) {
        throw '❌ Error while uploading image to Catbox.';
    }
    return responseText.trim();
}

cmd({
    pattern: 'hd',
    alias: ['remini', 'tohd'],
    desc: 'Enhance photo quality using AI',
    category: 'tools',
    filename: __filename,
    use: '(reply to an image)'
}, async (bot, message, client, {
    reply
}) => {
    await bot.sendMessage(message.key.remoteJid, {
        react: {
            text: '⏳',
            key: message.key
        }
    });

    try {
        let targetMessage = message.quoted || message;
        let mimeType = (targetMessage.msg || targetMessage).mimetype || targetMessage.mediaType || '';

        if (!mimeType) {
            throw '📷 Please send or reply to an image first.';
        }

        if (!/image\/(jpe?g|png)/.test(mimeType)) {
            throw `❌ The format *${mimeType}* is not supported.`;
        }

        let imageBuffer = await targetMessage.download?.();
        if (!imageBuffer) {
            throw '❌ Failed to download the image.';
        }

        // 1. Upload the image to get a direct URL
        const imageUrl = await uploadToCatbox(imageBuffer);

        // 2. Use the URL with the upscaling API
        const upscaleApiUrl = `https://www.apis-anomaki.zone.id/ai/ai-upscale?imageUrl=${encodeURIComponent(imageUrl)}`;
        const apiResponse = await fetch(upscaleApiUrl);

        if (!apiResponse.ok) {
            throw '❌ Error accessing the upscale API.';
        }

        const jsonResponse = await apiResponse.json();

        if (!jsonResponse || !jsonResponse.status || !jsonResponse.result?.result_url) {
            throw '❌ Invalid response from API.';
        }

        // 3. Download the enhanced image
        const enhancedImageBuffer = await fetch(jsonResponse.result.result_url).then(res => res.buffer());

        if (!enhancedImageBuffer || enhancedImageBuffer.length === 0) {
            throw '❌ Failed to fetch enhanced image.';
        }

        // 4. Send the enhanced image back
        await bot.sendMessage(message.chat, {
            image: enhancedImageBuffer,
            caption: '✅ *Image enhanced successfully!*'
        }, {
            quoted: message
        });

    } catch (error) {
        // Send a failure reaction and log the error
        await bot.sendMessage(message.key.remoteJid, {
            react: {
                text: '❌',
                key: message.key
            }
        });
        console.error(error);
        
        // Reply with a user-friendly error message
        const errorMessage = typeof error === 'string' ? error : '❌ An error occurred. Please try again later.';
        reply(errorMessage);
    }
});
