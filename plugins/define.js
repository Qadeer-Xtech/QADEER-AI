// define.js

const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: 'define',
    desc: 'Get the definition of a word',
    react: '🔍',
    category: 'search',
    filename: __filename,
    use: '<word>'
}, async (sock, m, message, { from, q: word, reply }) => {
    try {
        // If no word is provided, send the usage instructions
        if (!word) {
            const usage = 'Please provide a word to define.\n\n📌 *Usage:* .define [word]';
            return message.isGroup ? await reply(usage) : await sock.sendMessage(from, { text: usage }, { quoted: m });
        }

        const searchTerm = word.trim();
        const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${searchTerm}`;
        
        const response = await axios.get(apiUrl);
        const result = response.data[0];

        // Extract information from the API response
        const definition = result.meanings[0].definitions[0].definition;
        const example = result.meanings[0].definitions[0].example || '❌ No example available';
        const synonyms = result.meanings[0].definitions[0].synonyms.join(', ') || '❌ No synonyms available';
        const pronunciationText = result.phonetics[0]?.text || '🔇 No phonetics available';
        const pronunciationAudioUrl = result.phonetics[0]?.audio || null;

        // Format the response message
        const responseText = `📖 *Word*: *${result.word}* \n🗣️ *Pronunciation*: _${pronunciationText}_  \n📚 *Definition*: ${definition}  \n✍️ *Example*: ${example}  \n📝 *Synonyms*: ${synonyms}  \n\n🔗 *Powered By Patron Tech X*`;

        // Send the audio pronunciation first if it exists
        if (pronunciationAudioUrl) {
            await sock.sendMessage(from, {
                audio: { url: pronunciationAudioUrl },
                mimetype: 'audio/mpeg'
            }, { quoted: m });
        }
        
        // Send the formatted definition
        await sock.sendMessage(from, { text: responseText }, { quoted: m });

    } catch (error) {
        console.error("Error:", error);
        if (error.response && error.response.status === 404) {
            return reply('🚫 *Word not found.* Please check the spelling and try again.');
        }
        return reply('⚠️ An error occurred while fetching the definition. Please try again later.');
    }
});
