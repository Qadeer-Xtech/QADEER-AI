// filename: text-video.js
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');

async function veo3(prompt, { model, auto_sound = true, auto_speech = true, quality = "1080p" } = {}) {
    try {
        const availableModels = ['veo-3', 'veo-3-fast'];
        if (!prompt) throw new Error('Prompt is required');
        if (!availableModels.includes(model)) throw new Error('Available models: ' + availableModels.join(', '));

        const { data: turnstileData } = await axios.get('https://api.nekorinn.my.id/tools/rynn-stuff', {
            params: {
                'mode': 'turnstile-min',
                'siteKey': '0x4AAAAAAANuFg_hYO9YJZqo',
                'url': 'https://aivideogenerator.me/features/g-ai-video-generator',
                'accessKey': 'e2ddc8d3ce8a8fceb9943e60e722018cb23523499b9ac14a8823242e689eefed'
            }
        });

        const uniqueId = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
        
        const { data: creationData } = await axios.post('https://aiarticle.erweima.ai/api/v1/secondary-page/api/create', {
            'prompt': prompt,
            'imgUrls': [],
            'quality': quality,
            'duration': 15,
            'autoSoundFlag': auto_sound,
            'soundPrompt': '',
            'autoSpeechFlag': auto_speech,
            'speechPrompt': '',
            'speakerId': 'Auto',
            'aspectRatio': '16:9',
            'secondaryPageId': 713,
            'channel': 'aivideogenerator.me',
            'source': 'features',
            'type': 'features',
            'watermarkFlag': true,
            'privateFlag': true,
            'isTemp': true,
            'vipFlag': true,
            'model': model
        }, {
            headers: {
                'uniqueid': uniqueId,
                'verify': turnstileData.result.token
            }
        });

        while (true) {
            const { data: statusData } = await axios.get('https://aiarticle.erweima.ai/api/v1/secondary-page/api/' + creationData.data.recordId, {
                headers: {
                    'uniqueid': uniqueId,
                    'verify': turnstileData.result.token
                }
            });

            if (statusData.data.state === 'success') {
                return JSON.parse(statusData.data.completeData);
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

cmd({
    pattern: 'txt2vidfast',
    alias: ['veo3fast', 'text2videofast'],
    desc: 'Generate a fast AI video (model: veo-3-fast, 1080p, with sound and speech)',
    category: 'ai',
    filename: __filename
}, async (bot, msg, match, { text, reply }) => {
    await bot.sendMessage(msg.key.remoteJid, { react: { text: '⏳', key: msg.key } });
    if (!text) return reply('❌ Please enter a prompt to generate a video.\nExample: txt2vidfast a futuristic city at sunset');

    try {
        await reply('⏳ Generating fast video, please wait...');
        const result = await veo3(text, { model: 'veo-3-fast' });

        if (!result?.data?.video_url) {
            return reply('❌ Failed to get the video. Please try again later.');
        }

        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const videoFileName = 'video_' + Date.now() + '.mp4';
        const videoPath = path.join(tempDir, videoFileName);
        const writer = fs.createWriteStream(videoPath);

        const response = await axios.get(result.data.video_url, { responseType: 'stream' });
        response.data.pipe(writer);

        writer.on('finish', async () => {
            await bot.sendMessage(msg.chat, {
                video: fs.readFileSync(videoPath),
                mimetype: 'video/mp4',
                caption: '🎬 *AI Video (1080p, fast)*\n\n📝 Prompt: ' + text
            }, { quoted: msg });
            fs.unlinkSync(videoPath);
        });

        writer.on('error', async (err) => {
            console.error(err);
            reply('❌ Failed to download or send video.\n*Try command veo3fast*');
        });
    } catch (error) {
        reply('❌ Error: ' + (error?.message || error));
    }
});

cmd({
    pattern: 'veo3',
    alias: ['text2video', 'txt2vid'],
    desc: 'Generate a high-quality AI video (model: veo-3, 1080p, with sound and speech)',
    category: 'ai',
    filename: __filename
}, async (bot, msg, match, { text, reply }) => {
    await bot.sendMessage(msg.key.remoteJid, { react: { text: '⏳', key: msg.key } });
    if (!text) return reply('❌ Please enter a prompt to generate a video.\nExample: txt2vid a futuristic city at sunset');

    try {
        await reply('⏳ Generating high-quality video, please wait...');
        const result = await veo3(text, { model: 'veo-3' });

        if (!result?.data?.video_url) {
            return reply('❌ Failed to get the video. Please try again later.');
        }

        const tempDir = path.join(__dirname, '..', 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const videoFileName = 'video_' + Date.now() + '.mp4';
        const videoPath = path.join(tempDir, videoFileName);
        const writer = fs.createWriteStream(videoPath);

        const response = await axios.get(result.data.video_url, { responseType: 'stream' });
        response.data.pipe(writer);

        writer.on('finish', async () => {
            await bot.sendMessage(msg.chat, {
                video: fs.readFileSync(videoPath),
                mimetype: 'video/mp4',
                caption: '🎬 *AI Video (1080p, high quality)*\n\n📝 Prompt: ' + text
            }, { quoted: msg });
            fs.unlinkSync(videoPath);
        });

        writer.on('error', async (err) => {
            console.error(err);
            reply('❌ Failed to download or send video.');
        });
    } catch (error) {
        reply('❌ Error: ' + (error?.message || error));
    }
});
