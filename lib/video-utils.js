// video-utils.js

const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');

// Set the path to the installed ffmpeg executable
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Converts a video buffer into a WebP animated sticker buffer.
 * @param {Buffer} videoBuffer - The input video data as a buffer.
 * @returns {Promise<Buffer>} A promise that resolves with the converted WebP data as a buffer.
 */
async function videoToWebp(videoBuffer) {
    // Generate unique random filenames for the temporary input and output files
    const randomId = () => Crypto.randomBytes(6).readUIntLE(0, 6).toString(36);
    const inputVideoPath = path.join(tmpdir(), `${randomId()}.mp4`);
    const outputWebpPath = path.join(tmpdir(), `${randomId()}.webp`);

    // Write the video buffer to a temporary file
    fs.writeFileSync(inputVideoPath, videoBuffer);

    // Use a Promise to handle the asynchronous ffmpeg conversion process
    await new Promise((resolve, reject) => {
        ffmpeg(inputVideoPath)
            .on('error', reject) // Reject the promise if an error occurs
            .on('end', () => resolve(true)) // Resolve the promise on successful completion
            .addOutputOptions([
                '-vcodec', 'libwebp',
                '-vf', "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split [a][b];[a] palettegen=reserve_transparent=on:transparency_color=ffffff [p];[b][p] paletteuse",
                '-loop', '0',
                '-ss', '00:00:00', // Start time
                '-t', '00:00:05', // Duration of 5 seconds
                '-preset', 'default',
                '-an', // No audio
                '-vsync', '0'
            ])
            .toFormat('webp')
            .save(outputWebpPath);
    });

    // Read the resulting WebP file into a buffer
    const resultBuffer = fs.readFileSync(outputWebpPath);

    // Clean up by deleting the temporary files
    fs.unlinkSync(outputWebpPath);
    fs.unlinkSync(inputVideoPath);

    return resultBuffer;
}

module.exports = {
    videoToWebp
};
