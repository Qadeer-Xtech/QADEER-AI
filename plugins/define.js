const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: "define",
    desc: "📖 Get the definition of a word",
    react: "🔍",
    category: "new",
    filename: __filename,
},
async (conn, m, { q, from }) => { // Standard parameters
    try {
        if (!q) {
            const replyText = "Please provide a word to define.\n\n📌 *Usage:* .define [word]";
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }

        const word = q.trim();
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;

        const response = await axios.get(url);
        
        // Check karein ke API se data mila hai ya nahi
        if (!response.data || response.data.length === 0) {
            const replyText = `🚫 *Word not found:* "${word}". Please check the spelling.`;
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }

        const definitionData = response.data[0];
        const meaning = definitionData.meanings?.[0];
        const definitionDetails = meaning?.definitions?.[0];

        // Data ko ahtiyat se nikalain taake crash na ho
        const definition = definitionDetails?.definition || 'Not available';
        const example = definitionDetails?.example || 'Not available';
        const synonyms = (definitionDetails?.synonyms || []).join(', ') || 'Not available';
        
        // Phonetics aur Audio ke liye behtar handling
        const phoneticInfo = definitionData.phonetics?.find(p => p.text && p.audio) || definitionData.phonetics?.[0];
        const phonetics = phoneticInfo?.text || 'Not available';
        const audio = phoneticInfo?.audio || null;

        // Jawab ke liye text banayein
        const wordInfo = `📖 *Word:* *${definitionData.word}*
🗣️ *Pronunciation:* _${phonetics}_

📚 *Definition:*
${definition}

✍️ *Example:*
_${example}_

📝 *Synonyms:*
${synonyms}`;

        // Agar audio mojood hai to pehle audio bhej dein
        if (audio) {
            await conn.sendMessage(from, { 
                audio: { url: audio }, 
                mimetype: 'audio/mpeg',
                ptt: true // Isay voice note ke taur par bhejain
            }, { quoted: m });
        }

        // Phir definition wala text bhej dein
        await conn.sendMessage(from, { text: wordInfo }, { quoted: m });

    } catch (e) {
        console.error("❌ Define Error:", e);
        // 404 error (word not found) ke liye khaas message
        if (e.response && e.response.status === 404) {
            const replyText = `🚫 *Word not found:* "${q.trim()}". Please check the spelling and try again.`;
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }
        // Baaki tamam errors ke liye aam message
        const errorText = "⚠️ An error occurred while fetching the definition. Please try again later.";
        await conn.sendMessage(from, { text: errorText }, { quoted: m });
    }
});
