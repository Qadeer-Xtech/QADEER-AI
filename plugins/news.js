const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: 'news',
    desc: 'Get the latest news headlines.',
    category: 'news',
    filename: __filename
}, async (bot, message, context, { from, reply }) => {
    
    await bot.sendMessage(context.key.remoteJid, {
        react: { text: '📰', key: context.key }
    });

    try {
        const apiKey = '0f2c43ab11324578a7b1709651736382';
        const apiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;
        
        const response = await axios.get(apiUrl);
        const articles = response.data.articles;

        if (!articles.length) {
            return reply('No news articles found.');
        }

        // Send top 5 articles
        for (let i = 0; i < Math.min(articles.length, 5); i++) {
            const article = articles[i];
            
            let newsMessage = `
📰 *${article.title}*
⚠️ _${article.description || 'No description available.'}_
🔗 _${article.url}_

  ©𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽
`;
            
            if (article.urlToImage) {
                await bot.sendMessage(from, {
                    image: { url: article.urlToImage },
                    caption: newsMessage
                });
            } else {
                await bot.sendMessage(from, { text: newsMessage });
            }
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        reply('Could not fetch news. Please try again later.');
    }
});
