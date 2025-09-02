const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { tmpdir } = require('os');
const Crypto = require('crypto');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

// Set the path for the ffmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Fetches a GIF from a given URL and returns it as a buffer.
 * @param {string} gifUrl - The URL of the GIF to fetch.
 * @returns {Promise<Buffer>} A promise that resolves with the GIF data as a Buffer.
 * @throws {Error} Throws an error if the GIF could not be fetched.
 */
async function fetchGif(gifUrl) {
    try {
        const response = await axios.get(gifUrl, {
            responseType: 'arraybuffer' // We need the raw data
        });
        return response.data;
    } catch (error) {
        console.error('❌ Error fetching GIF:', error);
        throw new Error('Could not fetch GIF.');
    }
}

/**
 * Converts a GIF buffer into an MP4 video buffer.
 * @param {Buffer} gifBuffer - The buffer containing the GIF data.
 * @returns {Promise<Buffer>} A promise that resolves with the MP4 video data as a Buffer.
 * @throws {Error} Throws an error if the conversion fails.
 */
async function gifToVideo(gifBuffer) {
    // Generate unique, random filenames for temporary storage
    const randomId = Crypto.randomBytes(6).toString('hex');
    const tempGifPath = path.join(tmpdir(), `${randomId}.gif`);
    const tempVideoPath = path.join(tmpdir(), `${randomId}.mp4`);

    // Write the GIF buffer to a temporary file
    fs.writeFileSync(tempGifPath, gifBuffer);

    // Use a Promise to handle the asynchronous ffmpeg conversion
    await new Promise((resolve, reject) => {
        ffmpeg(tempGifPath)
            // Add output options for compatibility
            .outputOptions([
                '-movflags faststart',
                '-pix_fmt yuv420p', // Standard pixel format for wide compatibility
                '-vf scale=trunc(iw/2)*2:trunc(ih/2)*2' // Ensures dimensions are even, required by some codecs
            ])
            .on('end', resolve) // Resolve the promise on successful conversion
            .on('error', (err) => { // Reject on error
                console.error('❌ ffmpeg conversion error:', err);
                reject(new Error('Could not process GIF to video.'));
            })
            .save(tempVideoPath); // Save the output to the temp video file
    });

    // Read the resulting video file into a buffer
    const videoBuffer = fs.readFileSync(tempVideoPath);

    // Clean up temporary files
    fs.unlinkSync(tempGifPath);
    fs.unlinkSync(tempVideoPath);

    return videoBuffer;
}

module.exports = {
    fetchGif,
    gifToVideo
};
