const { ezra } = require('../fredi/ezra');
const { default: axios } = require('axios'); 

ezra({
    nomCom: 'pair1',
    aliases: ['paircode1', 'qrcode1', 'session1'], 
    reaction: '♂️',
    categorie: 'General'
}, async (jid, zoro, options) => {

    const { repondre, arg } = options;

    try {
        if (!arg || !arg[0]) {
            // If no number is provided, send instructions on how to use the command.
            return repondre(
                'Example Usage: .pair 92307xxxxxxx\n\n' +
                '*Please enter the command with your WhatsApp number without any + or space.*'
            );
        }

        // Notify the user that the process has started.
        await repondre('*Wait, Qadeer-AI is generating your pair code ✅...*');

        // The user's number is taken from the arguments. encodeURIComponent ensures it's URL-safe.
        const number = encodeURIComponent(arg.join(' '));

        // Construct the full URL for the pairing code API endpoint.
        const apiUrl = `https://tofan-session-3c389ebd74fb.herokuapp.com/code?number=${number}`;

        // Make an asynchronous GET request to the API.
        const response = await axios.get(apiUrl);
        const responseData = response.data;

        // Check if the API response is valid and contains a pairing code.
        if (responseData && responseData.code) {
            const pairCode = responseData.code;

            // Send the pairing code to the bot's own number. This is often done to log in
            // the bot on a new device or to be forwarded to the user's main account.
            await zoro.sendMessage(zoro.user.id, { text: pairCode });
            
            // Send a final confirmation and instruction message to the user who made the request.
            await repondre(
                `Here is your pair code:\n\n` +
                `*Please do not share this code with anyone.*\n\n` +
                `*Copy your pair code and paste it in WhatsApp on the linked device notification.*`
            );

        } else {
            // If the API response is missing the code, inform the user.
            throw new Error('Invalid response from API.');
        }

    } catch (error) {
        // If any part of the process fails, log the error and notify the user.
        console.error('Error getting response from API.', error.message);
        repondre('❌ Error getting response from the API. The service might be down or the number invalid.');
    }
});
