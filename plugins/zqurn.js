const { ezra } = require('../fredi/ezra');
const axios = require('axios');
const conf = require(__dirname + '/../set');

ezra({
    nomCom: 'quran',
    aliases: ['surah', 'qurann'],
    reaction: '🤲',
    categorie: 'God-first',
}, async (chatId, bot, utils) => {

    const { repondre: reply, arg: args, ms: quotedMessage } = utils;
    const query = args.join(' '); // User ka input (Surah ka naam ya number)

    // Agar user ne koi Surah specify nahi ki
    if (!query) {
        return reply('Please specify the surah number or name.', {
            contextInfo: {
                externalAdReply: {
                    title: 'Surah Reference Required',
                    body: 'Please specify the surah number or name.',
                    thumbnailUrl: conf.GURL, // Thumbnail image ka URL
                    sourceUrl: conf.URL, // Source link
                    mediaType: 1,
                    showAdAttribution: true
                }
            }
        });
    }

    try {
        // Quran API ka endpoint
        const apiUrl = `https://quran-endpoint.vercel.app/quran/${query}`;
        const response = await axios.get(apiUrl);

        // Agar API se status 200 OK na aaye (yani Surah na mile)
        if (response.data.status !== 200) {
            return reply('Invalid surah reference. Please specify a valid surah number or name.', {
                contextInfo: {
                    externalAdReply: {
                        title: 'Invalid Surah Reference',
                        body: 'Please specify a valid surah number or name.',
                        thumbnailUrl: conf.GURL,
                        sourceUrl: conf.URL,
                        mediaType: 1,
                        showAdAttribution: true
                    }
                }
            });
        }

        const surahData = response.data.data;

        // Jawab ke liye message tayyar karna
        const messageHeader = `ᬑ *QADEER AI QURAN SURAH* ᬒ\n\n*🕌 Quran: The Holy Book*\n📜 Surah ${surahData.number}: ${surahData.asma.ar.long} (${surahData.asma.en.long})`;
        const surahInfo = `Type: ${surahData.type.en}\nNumber of verses: ${surahData.ayahCount}`;
        const tafsirUrdu = `\n🔮 *Explanation (Urdu):* ${surahData.tafsir.id}`;
        const tafsirEnglish = `\n🔮 *Explanation (English):* ${surahData.tafsir.en}`;
        const footer = `\n╭────────────────◆\n│ *_Powered by ${conf.OWNER_NAME}*\n╰─────────────────◆`;

        const replyMessage = `${messageHeader}\n${surahInfo}${tafsirUrdu}${tafsirEnglish}${footer}`;

        // Format kiye gaye message ko user ke message ke jawab mein bhejna
        await bot.sendMessage(chatId, {
            text: replyMessage,
            contextInfo: {
                externalAdReply: {
                    title: 'QADEER AI QURAN SURAH',
                    body: `We're reading: ${surahData.asma.en.long}`,
                    mediaType: 1,
                    thumbnailUrl: conf.GURL,
                    sourceUrl: conf.GURL,
                    showAdAttribution: true
                }
            }
        }, { quoted: quotedMessage });

    } catch (error) {
        // Agar API call mein koi error aaye
        console.error('Error fetching Quran passage:', error);
        await reply('API request failed. Please try again later.', {
            contextInfo: {
                externalAdReply: {
                    title: 'Error Fetching Quran Passage',
                    body: 'Please try again later.',
                    thumbnailUrl: conf.GURL,
                    sourceUrl: conf.URL,
                    mediaType: 1,
                    showAdAttribution: true
                }
            }
        });
    }
});
