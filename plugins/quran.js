const fetch = require('node-fetch');
const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const { translate } = require('@vitalets/google-translate-api');

// Command to fetch a specific Surah
cmd({
    pattern: "surah",
    alias: ["quran"],
    desc: "Get Quran Surah details and explanation.",
    category: "main",
    filename: __filename
}, async (sock, buddy, m, { args, reply }) => {
    
    await sock.sendMessage(m.key.remoteJid, { react: { text: '🤍', key: m.key } });

    try {
        const query = args[0];
        if (!query) {
            return reply("Type Surah Number or Type *.Surahmenu* for getting Surah numbers");
        }

        const allSurahsData = await fetchJson('https://quran-endpoint.vercel.app/quran');
        const allSurahs = allSurahsData.data;

        const foundSurah = allSurahs.find(s =>
            s.number === Number(query) ||
            s.asma.ar.short.toLowerCase() === query.toLowerCase() ||
            s.asma.en.short.toLowerCase() === query.toLowerCase()
        );

        if (!foundSurah) {
            return reply(`Couldn't find surah with number or name "${query}"`);
        }

        const surahResponse = await fetch(`https://quran-endpoint.vercel.app/quran/${foundSurah.number}`);
        if (!surahResponse.ok) {
            const errorData = await surahResponse.json();
            return reply(`API request failed with status ${surahResponse.status} and message ${errorData.message}`);
        }

        const surahData = await surahResponse.json();
        const tafsirUrdu = await translate(surahData.data.tafsir.id, { to: 'ur', autoCorrect: true });
        const tafsirEnglish = await translate(surahData.data.tafsir.id, { to: 'en', autoCorrect: true });

        let caption = `\n🕋 *Quran: The Holy Book ♥️🌹قرآن مجید🌹♥️*\n\n` +
            `📖 *Surah ${surahData.data.number}: ${surahData.data.asma.ar.long} (${surahData.data.asma.en.long})*\n\n` +
            `💫Type: ${surahData.data.type.en}\n` +
            `\n✅Number of verses: ${surahData.data.ayahCount}\n` +
            `\n⚡🔮 *Explanation (Urdu):*\n\n${tafsirUrdu.text}\n` +
            `\n⚡🔮 *Explanation (English):*\n\n${tafsirEnglish.text}`;

        await sock.sendMessage(m.key.remoteJid, {
            image: { url: 'https://qu.ax/Pusls.jpg' },
            caption: caption
        }, { quoted: buddy });

        if (surahData.data.recitation.full) {
            await sock.sendMessage(m.key.remoteJid, {
                audio: { url: surahData.data.recitation.full },
                mimetype: 'audio/mpeg',
                ptt: true
            }, { quoted: buddy });
        }

    } catch (error) {
        console.error(error);
        reply(`Error: ${error.message}`);
    }
});

// Command to display the list of all Surahs
cmd({
    pattern: "quranmenu",
    alias: ["surahlist", "surahmenu"],
    desc: "menu the bot",
    category: "menu",
    filename: __filename
}, async (sock, buddy, m, { reply }) => {

    await sock.sendMessage(m.key.remoteJid, { react: { text: '❤️', key: m.key } });

    try {
        const surahMenuText = `❤️  ⊷┈ *QURAN KAREEM* ┈⊷  🤍

 💫 𝘈𝘭𝘭 𝘴𝘶𝘳𝘢𝘩 𝘢𝘯𝘥 𝘵𝘩𝘦𝘪𝘳 𝘯𝘶𝘮𝘣𝘦𝘳𝘴 𝘭𝘪𝘴𝘵
𝘧𝘰𝘳 𝘨𝘦𝘵𝘵𝘪𝘯𝘨 𝘴𝘶𝘳𝘢𝘩 𝘵𝘺𝘱𝘦 .𝘴𝘶𝘳𝘢𝘩 36 💫🌸 
\n1. 🕌 Al-Fatiha (The Opening) - الفاتحہ (پہلا سورہ)
\n2. 🐄 Al-Baqarah (The Cow) - البقرہ (گائے)
\n3. 🏠 Aali Imran (The Family of Imran) - آل عمران (عمران کا خاندان)
... (and so on for all 114 surahs) ...
\n114. 🌐 An-Nas (Mankind) - الناس (انسانیت)`;

        await sock.sendMessage(m.key.remoteJid, {
            image: { url: 'https://qu.ax/Pusls.jpg' },
            caption: surahMenuText
        }, { quoted: buddy });

        await sock.sendMessage(m.key.remoteJid, {
            audio: { url: 'https://github.com/Qadeer-Xtech/TOFAN-DATA/raw/refs/heads/main/autovoice/Quran.m4a' },
            mimetype: 'audio/mp4',
            ptt: false
        }, { quoted: buddy });

    } catch (error) {
        console.log(error);
        reply('' + error);
    }
});
