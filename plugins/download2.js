// download2.js

const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

cmd({
    pattern: 'download',
    alias: ['instagram2', 'ig2', 'tiktok2', 'tt2', 'fb'],
    desc: 'Download videos or photos from TikTok, Instagram, or Facebook',
    category: 'downloader',
    filename: __filename,
    use: '<link>'
}, async (sock, m, message, { from, args, reply, command }) => {
    try {
        const link = args[0];
        if (!link) {
            return reply(`❌ Please provide a link.\nExample:\n.${command} https://vt.tiktok.com/ZSBKKk4HS/`);
        }

        // Determine the platform based on the command alias used
        const platform = command.includes('tt') || command.includes('tiktok') ? 'tiktok'
                       : command.includes('ig') || command.includes('instagram') ? 'instagram'
                       : command.includes('fb') || command.includes('facebook') ? 'facebook'
                       : null;

        if (!platform) {
            return reply('❌ Unsupported platform.');
        }

        await sock.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const baseUrl = 'https://instatiktok.com/';
        const params = new URLSearchParams();
        params.append('url', link);
        params.append('platform', platform);
        params.append('api', baseUrl);

        // Make a request to the download service
        const response = await axios.post(`${baseUrl}download`, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': baseUrl,
                'Referer': baseUrl,
                'User-Agent': 'Mozilla/5.0',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        const html = response?.data?.html;
        if (!html || response?.data?.status !== 'success') {
            return reply('❌ Failed to fetch data from server.');
        }

        // Scrape the download links from the response HTML
        const $ = cheerio.load(html);
        const mediaLinks = [];
        $('a.btn[href^="http"]').each((i, elem) => {
            const href = $(elem).attr('href');
            if (href && !mediaLinks.includes(href)) {
                mediaLinks.push(href);
            }
        });

        if (mediaLinks.length === 0) {
            return reply('❌ No media links found.');
        }
        
        // Select the appropriate link(s)
        let finalUrls = platform === 'instagram' 
            ? mediaLinks 
            : [mediaLinks.find(url => /hdplay/.test(url)) || mediaLinks.at(-1)];

        if (!finalUrls || finalUrls.length === 0) {
            return reply('❌ Could not retrieve download link.');
        }

        const poweredBy = '\n\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽* 🤖';
        
        // Download and send each media file
        for (const url of finalUrls) {
            if (!url) continue;
            const buffer = await axios.get(url, { responseType: 'arraybuffer' }).then(res => res.data);
            const isVideo = url.includes('.mp4');
            const caption = `📥 *${platform.toUpperCase()} Download Successful!*` + poweredBy;
            await sock.sendMessage(from, isVideo ? { video: buffer, caption } : { image: buffer, caption }, { quoted: m });
        }
        
        await sock.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error(error);
        reply(`❌ An error occurred.\n\n${error.message || error}`);
    }
});
