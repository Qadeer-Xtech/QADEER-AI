// dl-tiktok.js

const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const moment = require('moment-timezone');
const { cmd } = require('../command');

/**
 * First attempt to download TikTok video using tikwm.com API.
 */
async function tiktokV1(url) {
    const params = new URLSearchParams();
    params.append('url', url);
    params.append('hd', '1');
    const { data } = await axios.post('https://tikwm.com/api/', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': 'current_language=en',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        }
    });
    return data;
}

/**
 * Second attempt to download TikTok video by scraping savetik.co.
 */
async function tiktokV2(url) {
    const form = new FormData();
    form.append('q', url);
    const { data } = await axios.post('https://savetik.co/api/ajaxSearch', form, {
        headers: {
            ...form.getHeaders(),
            'Accept': '*/*',
            'Origin': 'https://savetik.co',
            'Referer': 'https://savetik.co/en2',
            'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
    const html = data.data;
    const $ = cheerio.load(html);
    const title = $('.thumbnail .content h3').text().trim();
    const thumbnail = $('.thumbnail .image-tik img').attr('src');
    const video_url = $('video#vid').attr('data-src');
    const slide_images = [];
    $('.photo-list .download-box li').each((i, element) => {
        const imageUrl = $(element).find('.download-items__thumb img').attr('src');
        if (imageUrl) slide_images.push(imageUrl);
    });
    return { title, thumbnail, video_url, slide_images };
}

cmd({
    pattern: 'tiktok',
    alias: ['tt', 'ttdl'],
    desc: 'Download TikTok video or slideshow',
    category: 'downloader',
    filename: __filename
}, async (sock, m, { text, reply }) => {

    if (!text) return reply('Please provide a valid TikTok URL.\nExample: .tiktok https://vt.tiktok.com/xxxxx');
    await reply("Processing...");

    try {
        let videoData = {};
        let slideImages = [];

        // Attempt method 1
        const v1Result = await tiktokV1(text);
        if (v1Result?.data) {
            const data = v1Result.data;
            if (Array.isArray(data.images) && data.images.length > 0) {
                slideImages = data.images;
            } else if (Array.isArray(data.image_post) && data.image_post.length > 0) {
                slideImages = data.image_post;
            }
            videoData = {
                title: data.title,
                region: data.region,
                duration: data.duration,
                create_time: data.create_time,
                play_count: data.play_count,
                digg_count: data.digg_count,
                comment_count: data.comment_count,
                share_count: data.share_count,
                download_count: data.download_count,
                author: {
                    unique_id: data.author?.unique_id,
                    nickname: data.author?.nickname,
                },
                music_info: {
                    title: data.music_info?.title,
                    author: data.music_info?.author,
                },
                cover: data.cover,
                play: data.play,
                hdplay: data.hdplay,
                wmplay: data.wmplay,
            };
        }

        // Attempt method 2 as fallback
        const v2Result = await tiktokV2(text);
        if (!videoData?.play && slideImages.length === 0 && v2Result.video_url) {
            videoData = { ...videoData, play: v2Result.video_url };
        }
        if (Array.isArray(v2Result.slide_images) && v2Result.slide_images.length > 0) {
            slideImages = v2Result.slide_images;
        }

        // Handle slideshows
        if (slideImages.length > 0) {
            await reply(`Detected ${slideImages.length} image(s).`);
            for (const imageUrl of slideImages) {
                await sock.sendMessage(m.chat, {
                    image: { url: imageUrl },
                    caption: videoData?.title || '',
                }, { quoted: m });
            }
            return;
        }

        // Handle single videos
        const uploadedAt = videoData.create_time ?
            moment.unix(videoData.create_time).tz('Africa/Lagos').format('dddd, D MMMM YYYY [at] HH:mm:ss') :
            '-';

        const caption = `📹 *TikTok Video Information*\n\n🎵 *Title:* ${videoData.title || '-'}` +
            `\n🌍 *Region:* ${videoData.region || 'N/A'}` +
            `\n⏱ *Duration:* ${videoData.duration || '-'} seconds` +
            `\n📅 *Uploaded:* ${uploadedAt}` +
            `\n\n━━━━━━━━━━━━━━━` +
            `\n📊 *Statistics*` +
            `\n👁 *Views:* ${videoData.play_count?.toLocaleString() || 0}` +
            `\n❤️ *Likes:* ${videoData.digg_count?.toLocaleString() || 0}` +
            `\n💬 *Comments:* ${videoData.comment_count?.toLocaleString() || 0}` +
            `\n🔄 *Shares:* ${videoData.share_count?.toLocaleString() || 0}` +
            `\n⬇️ *Downloads:* ${videoData.download_count?.toLocaleString() || 0}` +
            `\n\n━━━━━━━━━━━━━━━` +
            `\n👤 *Author*` +
            `\n🔗 *Username:* ${videoData.author?.unique_id || '-'}` +
            `\n📛 *Name:* ${videoData.author?.nickname || '-'}`;

        const videoUrl = videoData.play || videoData.hdplay || videoData.wmplay;
        
        if (videoUrl) {
            await sock.sendMessage(m.chat, { video: { url: videoUrl }, caption: caption }, { quoted: m });
        } else if (videoData.cover) {
            await sock.sendMessage(m.chat, { image: { url: videoData.cover }, caption: "Video cover" }, { quoted: m });
        }

    } catch (error) {
        reply(`Error: ${error.message}`);
    }
});
