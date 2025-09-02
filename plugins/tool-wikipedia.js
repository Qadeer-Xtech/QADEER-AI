// tool-wikipedia.js
const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const { translate } = require('@vitalets/google-translate-api');

cmd({
    pattern: 'wikipedia',
    alias: ['wiki'],
    desc: 'Fetch Wikipedia information and translate to English.',
    category: 'information',
    filename: __filename,
    use: '.wikipedia <search query>'
}, async (client, message, m, { from, q, reply }) => {

    // React to the message to indicate processing
    await client.sendMessage(m.chat, {
        react: {
            text: '📖',
            key: m.key
        }
    });

    try {
        // Check if a search query is provided
        if (!q) {
            return reply('Please provide a search query for Wikipedia.');
        }

        await reply('Searching Wikipedia...');

        // Fetch data from the Wikipedia API
        const searchResult = await fetchJson(`https://api.siputzx.my.id/api/s/wikipedia?query=${encodeURIComponent(q)}`);

        if (!searchResult.status || !searchResult.data) {
            return reply('No results found for your query.');
        }

        const { wiki, thumb } = searchResult.data;
        
        // Translate the result to English
        const translatedResult = await translate(wiki, { to: 'en' });

        let caption = `📖 *Wikipedia Result*\n\n📝 *Query:* ${q}\n\n${translatedResult.text}`;

        // Send the result with a thumbnail if available
        if (thumb) {
            await client.sendMessage(m.chat, {
                image: { url: thumb },
                caption: caption
            });
        } else {
            await reply(caption);
        }

    } catch (error) {
        console.error(error);
        reply(`An error occurred: ${error.message}`);
    }
});
