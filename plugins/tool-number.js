// tool-number.js
const { cmd } = require('../command');
const axios = require('axios');

// Get temporary numbers for a country
cmd({
    pattern: 'tempnum',
    alias: ['fakenum', 'tempnumber'],
    desc: 'Get temporary numbers & OTP instructions',
    category: 'tools',
    use: '<country-code>'
}, async (client, message, m, { from, args, reply }) => {
    await client.sendMessage(m.key.remoteJid, { react: { text: '📱', key: m.key } });

    try {
        if (!args || args.length < 1) {
            return reply('❌ *Usage:* .tempnum <country-code>\nExample: .tempnum us\n\n📦 Use .otpbox <number>* to check OTPs');
        }

        const countryCode = args[0].toLowerCase();
        const { data } = await axios.get(`https://api.vreden.my.id/api/tools/fakenumber/listnumber?id=${countryCode}`, {
            timeout: 10000,
            validateStatus: status => status === 200
        });

        if (!data?.result || !Array.isArray(data.result)) {
            console.error("Invalid API structure:", data);
            return reply('⚠ Invalid API response format\nTry .tempnum us');
        }

        if (data.result.length === 0) {
            return reply(`📭 No numbers available for *${countryCode.toUpperCase()}*\nTry another country code!\n\nUse .otpbox <number> after selection`);
        }

        const numbersList = data.result.slice(0, 25);
        const formattedList = numbersList.map((item, index) =>
            `${String(index + 1).padStart(2, ' ')}. ${item.number}`
        ).join('\n');
        
        await reply(
            `╭──「 📱 TEMPORARY NUMBERS 」\n` +
            `│\n` +
            `│ Country: ${countryCode.toUpperCase()}\n` +
            `│ Numbers Found: ${numbersList.length}\n` +
            `│\n` +
            `${formattedList}\n\n` +
            `╰──「 📦 USE: .otpbox <number> 」\n`
        );

    } catch (error) {
        console.error("TEMP NUMBER ERROR:", error);
        const errorMessage = error.code === 'ECONNABORTED' 
            ? '⏳ *Timeout*: API took too long\nTry smaller country codes like \'us\', \'gb\''
            : `⚠ *Error*: ${error.message}\nUse format: .tempnum <country-code>`;
        reply(`${errorMessage}\n\n🔑 Remember: ${prefix}templist`);
    }
});

// Get list of available countries
cmd({
    pattern: 'templist',
    alias: ['tempnlist', '.templist', 'tempnumberlist'],
    desc: 'Show list of countries with temp numbers',
    category: 'tools',
    filename: __filename,
    use: 'otpinbox <number>'
}, async (client, message, { reply }) => {
    await client.sendMessage(message.key.remoteJid, { react: { text: '🌍', key: message.key } });

    try {
        const { data } = await axios.get('https://api.vreden.my.id/api/tools/fakenumber/country');
        if (!data || !data.result) {
            return reply('❌ Couldn\'t fetch country list.');
        }

        const countryList = data.result.map((country, index) => 
            `*${index + 1}.* ${country.title} \`(${country.id})\``
        ).join('\n');
        
        await reply(`🌍 *Total Available Countries:* ${data.result.length}\n\n${countryList}`);
    } catch (error) {
        console.error('TEMP LIST ERROR:', error);
        reply('❌ Failed to fetch temporary number country list.');
    }
});

// Check OTP messages for a number
cmd({
    pattern: 'otpbox',
    alias: ['checkotp', 'getotp'],
    desc: 'Check OTP messages for temporary number',
    category: 'tools',
    use: '<full-number>'
}, async (client, message, m, { from, args, reply }) => {
    await client.sendMessage(m.key.remoteJid, { react: { text: '🔑', key: m.key } });

    try {
        if (!args[0] || !args[0].startsWith('+')) {
            return reply('❌ *Usage:* .otpbox <full-number>\nExample: .otpbox +923xx');
        }

        const number = args[0].trim();
        const { data } = await axios.get(`https://api.vreden.my.id/api/tools/fakenumber/message?nomor=${encodeURIComponent(number)}`, {
            timeout: 10000,
            validateStatus: status => status === 200
        });

        if (!data?.result || !Array.isArray(data.result)) {
            return reply('⚠ No OTP messages found for this number');
        }

        const messages = data.result.map(msg => {
            const otpCode = msg.content.match(/\b\d{4,8}\b/g);
            const code = otpCode ? otpCode[0] : 'Not found';
            return `┌ *From:* ${msg.from || 'Unknown'}\n│ *Code:* ${code}\n│ *Time:* ${msg.time_wib || msg.timestamp}\n└ *Message:* ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`;
        }).join('\n\n');

        await reply(
            `╭──「 🔑 OTP MESSAGES 」\n`+
            `│ Number: ${number}\n`+
            `│ Messages Found: ${data.result.length}\n`+
            `│\n`+
            `${messages}\n`+
            `╰──「 📌 Use .tempnum to get numbers 」`
        );
    } catch (error) {
        console.error("OTP Check Error:", error);
        const errorMessage = error.code === 'ECONNABORTED' 
            ? '⌛ OTP check timed out. Try again later'
            : `⚠ Error: ${error.response?.data?.error || error.message}`;
        reply(`${errorMessage}\n\nUsage: .otpbox +923xx`);
    }
});
