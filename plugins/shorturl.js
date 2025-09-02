// shorturl.js
const axios = require('axios');
const { cmd } = require('../command');

/**
 * Shortens a URL using the zenzxz.my.id API.
 * @param {string} url The long URL to shorten.
 * @returns {Promise<object>} The API response containing the short URL.
 */
async function createShortUrl(url) {
    const apiUrl = 'https://shorturl.zenzxz.my.id/shorten';
    const payload = { url: url };
    const headers = {
        'Content-Type': 'application/json',
        'Origin': 'https://shorturl.zenzxz.my.id',
        'Referer': 'https://shorturl.zenzxz.my.id/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
    };

    const { data } = await axios.post(apiUrl, payload, { headers: headers });
    return data;
}

cmd({
    pattern: 'shorturl',
    alias: ['shortlink', 'tinyurl'],
    desc: 'Create a short link from a long URL',
    category: 'tools',
    use: '<link>',
    filename: __filename
}, async (client, message, m, { args, q, reply, command }) => {
    try {
        let longUrl = q?.trim() || args.join(' ').trim();

        if (!longUrl) {
            return reply(`❌ Please provide a URL.\nExample:\n${command} https://example.com`);
        }

        // Add protocol if missing
        if (!/^https?:\/\//i.test(longUrl)) {
            longUrl = 'https://' + longUrl;
        }

        await reply('⏳ Creating short link...');
        
        let result = await createShortUrl(longUrl);

        if (!result || !result.short) {
            return reply('❌ Failed to create short link.');
        }

        await reply(`✅ Short link created successfully!\n🔗 ${result.short}`);
    } catch (error) {
        reply(`⚠️ Error: ${error.message}`);
    }
});
