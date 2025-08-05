const { ezra } = require('../fredi/ezra');
const { default: axios } = require('axios');

ezra({
    nomCom: 'ai2',
    reaction: '🛰️',
    categorie: 'AI',
}, async (jid, zoro, options) => {
    const { repondre, arg } = options;
    const userInput = arg.join(' ');

    if (!userInput) {
        return repondre("Example: .ai2 Hello, how are you?");
    }

    try {
        const apiUrl = `https://api.popcat.xyz/chatbot?msg=${encodeURIComponent(userInput)}&owner=QADEER&botname=QADEER-AI`;
        const response = await axios.get(apiUrl);
        repondre(response.data.response);
    } catch (error) {
        console.error("ai2 command error:", error);
        repondre("Oops, an error occurred with the AI service.");
    }
});


ezra({
    nomCom: 'ai1',
    reaction: '🛰️',
    categorie: 'AI',
}, async (jid, zoro, options) => {
    const { repondre, arg } = options;
    const userInput = arg.join(' ');

    if (!userInput) {
        return repondre("Example: .ai1 What is the capital of Pakistan?");
    }

    try {
        const apiUrl = `https://api.maher-zubair.tech/ai/chatgpt?q=${encodeURIComponent(userInput)}`;
        const response = await axios.get(apiUrl);
        repondre(response.data.result);
    } catch (error) {
        console.error("ai1 command error:", error);
        repondre("Oops, an error occurred with the AI service.");
    }
});


ezra({
    nomCom: 'dalle',
    reaction: '🛰️',
    categorie: 'AI',
}, async (jid, zoro, options) => {
    const { repondre, arg, ms } = options;
    const prompt = arg.join(' ');

    if (!prompt) {
        return repondre("Example: .dalle a painting of Faisalabad clock tower in the style of Van Gogh");
    }

    try {
        const apiUrl = `https://api.maher-zubair.tech/ai/photoleap?q=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);

        // The API returns a URL to the generated image
        const imageUrl = response.data.result;

        // Send the image back to the user
        await zoro.sendMessage(jid, {
            image: { url: imageUrl },
            caption: "*𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*"
        }, { quoted: ms });

    } catch (error) {
        console.error("dalle command error:", error);
        repondre("Sorry, I couldn't generate an image for that prompt.");
    }
});


const imagineCommand = async (jid, zoro, options) => {
    const { repondre, arg, ms } = options;
    const prompt = arg.join(' ');

    if (!prompt) {
        return repondre("Example: .imagine a futuristic cityscape of Faisalabad");
    }

    try {
        const apiUrl = `https://api.maher-zubair.tech/ai/imagine?q=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl);
        
        const imageUrl = response.data.result;

        await zoro.sendMessage(jid, {
            image: { url: imageUrl },
            caption: "*𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*"
        }, { quoted: ms });

    } catch (error) {
        console.error("imagine/ad command error:", error);
        repondre("Sorry, I couldn't generate an image for that prompt.");
    }
};

// Both 'ad' and 'imagine' trigger the same function
ezra({ nomCom: 'ad', reaction: '🛰️', categorie: 'AI' }, imagineCommand);
ezra({ nomCom: 'imagine', reaction: '🛰️', categorie: 'AI' }, imagineCommand);

