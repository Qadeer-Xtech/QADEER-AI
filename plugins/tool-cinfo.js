// tool-cinfo.js
const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: 'countryinfo',
    alias: ['country', 'cinfo2'],
    desc: 'Get information about a country',
    category: 'info',
    filename: __filename
}, async (client, message, m, { from, args, q, reply, react }) => {
    
    await client.sendMessage(m.key.remoteJid, { react: { text: '🌍', key: m.key } });

    try {
        if (!q) {
            return reply('Please provide a country name.\nExample: `.countryinfo Pakistan`');
        }

        const apiUrl = `https://api.siputzx.my.id/api/tools/countryInfo?name=${encodeURIComponent(q)}`;
        const { data: apiResponse } = await axios.get(apiUrl);

        if (!apiResponse.status || !apiResponse.data) {
            await react('❌');
            return reply(`No information found for *${q}*. Please check the country name.`);
        }

        const country = apiResponse.data;

        let neighborsText = country.neighbors.length > 0
            ? country.neighbors.map(n => `*${n.name}*`).join(', ')
            : 'No neighboring countries found.';

        const infoText = `🌍 *Country Information: ${country.name}* 🌍

🏛 *Capital:* ${country.capital}
📍 *Continent:* ${country.continent.name} ${country.continent.emoji}
📞 *Phone Code:* +${country.phoneCode}
📏 *Area:* ${country.area.squareKilometers} km² (${country.area.squareMiles} mi²)
🚗 *Driving Side:* ${country.drivingSide}
💱 *Currency:* ${country.currency}
𔤤 *Languages:* ${country.languages.native.join(', ')}
🌟 *Famous For:* ${country.famousFor}
🌍 *ISO Codes:* ${country.isoCode.alpha2.toUpperCase()}, ${country.isoCode.alpha3.toUpperCase()}
🌎 *Internet TLD:* ${country.internetTLD}

🔗 *Neighbors:* ${neighborsText}`;

        await client.sendMessage(from, {
            image: { url: country.flag },
            caption: infoText,
            contextInfo: { mentionedJid: [m.sender] }
        }, { quoted: message });

        await react('✅');

    } catch (error) {
        console.error('Error in countryinfo command:', error);
        await react('❌');
        reply('An error occurred while fetching country information.');
    }
});
