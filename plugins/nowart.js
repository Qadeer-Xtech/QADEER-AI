const crypto = require('crypto');
const axios = require('axios');
const { cmd } = require('../command');

// Function for AI Chat
async function nowchat(prompt) {
    const timestamp = Date.now().toString();
    const secretKey = 'sha512';
    const hmac = crypto.createHmac(secretKey, 'dfaugf098ad0g98-idfaugf098ad0g98-iduoafiunoa-f09a8s098a09ea-a0s8g-asd8g0a9d--gasdga8d0g8a0dg80a9sd8g0a9d8gduoafiunoa-f09adfaugf098ad0g98-iduoafiunoa-f09a8s098a09ea-a0s8g-asd8g0a9d--gasdga8d0g8a0dg80a9sd8g0a9d8g8s098a09ea-a0s8g-asd8g0a9d--gasdga8d0g8a0dg80a9sd8g0a9d8g')
        .update(timestamp)
        .digest('base64');
    
    const requestData = JSON.stringify({ content: prompt });

    const options = {
        method: 'POST',
        url: 'http://aichat.nowtechai.com/now/v1/ai',
        headers: {
            'User-Agent': 'okhttp/5.0.0-alpha.9',
            'Connection': 'Keep-Alive',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip',
            'Content-Type': 'application/json',
            'Key': hmac,
            'TimeStamps': timestamp,
            'Accept-Charset': 'UTF-8'
        },
        data: requestData,
        responseType: 'stream'
    };

    return new Promise((resolve, reject) => {
        axios(options)
            .then(response => {
                let fullResponse = '';
                response.data.on('data', chunk => {
                    const lines = chunk.toString().split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                            try {
                                const jsonData = JSON.parse(line.replace('data: ', ''));
                                const content = jsonData?.choices?.[0]?.delta?.content;
                                if (content) {
                                    fullResponse += content;
                                }
                            } catch {}
                        }
                    }
                });
                response.data.on('end', () => resolve(fullResponse.trim()));
                response.data.on('error', reject);
            })
            .catch(reject);
    });
}

// Function for AI Art/Image Generation
async function nowart(prompt) {
    const response = await axios.get(`http://art.nowtechai.com/art?name=${prompt}`, {
        headers: {
            'User-Agent': 'Ktor client',
            'Connection': 'Keep-Alive',
            'Accept': 'application/json',
            'Accept-Encoding': 'gzip',
            'Content-Type': 'application/json'
        }
    });
    return response.data;
}

// Command: nowai / nowchat
cmd({
    pattern: 'nowai',
    alias: ['nowchat'],
    desc: 'Ask NowTech AI a question',
    category: 'ai',
    filename: __filename
}, async (bot, message, context, { args, reply }) => {
    const query = args.join(' ').trim();
    if (!query) {
        return reply('❌ What do you want to ask?');
    }
    try {
        const result = await nowchat(query);
        reply(result);
    } catch (error) {
        reply('❌ An error occurred: ' + error.message);
    }
});

// Command: nowimg / nowart / nowimage
cmd({
    pattern: 'nowimg',
    alias: ['nowart', 'nowimage'],
    desc: 'Generate AI image using NowTech Art',
    category: 'ai',
    filename: __filename
}, async (bot, message, context, { args }) => {
    const prompt = args.join(' ').trim();
    if (!prompt) {
        return context.reply('❌ Please provide a prompt.');
    }
    try {
        const result = await nowart(prompt);
        for (const imageData of result.data) {
            await bot.sendMessage(context.chat, {
                image: { url: imageData.img_url }
            }, { quoted: context });
        }
    } catch (error) {
        context.reply('❌ An error occurred: ' + error.message);
    }
});
