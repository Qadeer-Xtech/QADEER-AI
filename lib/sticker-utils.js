// sticker-utils.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

// Set the path for the ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Fetches an image from a URL.
 * @param {string} imageUrl - The URL of the image.
 * @returns {Promise<Buffer>} The image data as a buffer.
 * @throws {Error} If the image fetch fails.
 */
async function fetchImage(imageUrl) {
    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching image:', error);
        throw new Error('Could not fetch image.');
    }
}

/**
 * Fetches a GIF from a URL.
 * @param {string} gifUrl - The URL of the GIF.
 * @returns {Promise<Buffer>} The GIF data as a buffer.
 * @throws {Error} If the GIF fetch fails.
 */
async function fetchGif(gifUrl) {
    try {
        const response = await axios.get(gifUrl, {
            responseType: 'arraybuffer'
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching GIF:', error);
        throw new Error('Could not fetch GIF.');
    }
}

/**
 * Converts a GIF buffer into a WebP animated sticker buffer.
 * @param {Buffer} gifBuffer - The input GIF data as a buffer.
 * @returns {Promise<Buffer>} A promise that resolves with the converted WebP sticker data.
 */
async function gifToSticker(gifBuffer) {
    // Generate unique, random filenames for temporary storage
    const randomId = () => Crypto.randomBytes(6).toString('hex');
    const inputGifPath = path.join(tmpdir(), `${randomId()}.gif`);
    const outputStickerPath = path.join(tmpdir(), `${randomId()}.webp`);

    // Write the GIF buffer to a temporary file
    fs.writeFileSync(inputGifPath, gifBuffer);

    // Use a Promise to handle the asynchronous ffmpeg conversion
    await new Promise((resolve, reject) => {
        ffmpeg(inputGifPath)
            .on('error', reject)
            .on('end', () => resolve(true))
            .addOutputOptions([
                '-vcodec', 'libwebp',
                '-vf', "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split [a][b];[a] palettegen=reserve_transparent=on:transparency_color=ffffff [p];[b][p] paletteuse",
                '-loop', '0',
                '-an', // No audio
                '-vsync', '0',
                '-preset', 'default'
            ])
            .toFormat('webp')
            .save(outputStickerPath);
    });

    // Read the resulting sticker file into a buffer
    const stickerBuffer = fs.readFileSync(outputStickerPath);

    // Clean up temporary files
    fs.unlinkSync(outputStickerPath);
    fs.unlinkSync(inputGifPath);

    return stickerBuffer;
}

module.exports = {
    fetchImage,
    fetchGif,
    gifToSticker
};
