const axios = require('axios');
const { cmd } = require('../command');
const config = require('../config');

cmd({
    on: 'body'
}, async (sock, m, store, { body }) => {
    try {
        // Determine if the message is from the bot itself
        const isFromMe = store.key?.fromMe || (store.sender === sock.decodeJid(sock.user.id));
        const query = body?.trim();

        // Conditions to exit:
        // 1. Message is from the bot.
        // 2. AUTO_REPLY feature is not enabled.
        // 3. Message is empty or is a command.
        if (isFromMe || config.AUTO_REPLY !== 'true' || !query || query.startsWith(config.PREFIX)) {
            return;
        }

        const encodedQuery = encodeURIComponent(query);
        const encodedLogic = encodeURIComponent(
            'Be as human and natural as possible. Every reply should feel smooth, and slightly unpredictable You don’t try to dominate; Respond briefly. Never sound like an assistant or AI — you’re just a person with a unique perspective. Use emojis sparingly, only when it adds to the charm. Avoid being overly formal or robotic. Your goal is to engage and intrigue, not to inform or assist in a conventional way.'
        );

        const apiUrl = 'https://api.nekorinn.my.id/ai/chatbot?ai_name=Patron&text=' + encodedQuery + '&logic=' + encodedLogic;

        const response = await axios.get(apiUrl);
        const result = response.data?.result;

        if (response.data?.status && result) {
            await store.reply(result);
        } else {
            console.log('⚠️ No AI response returned. Full response:', response.data);
        }

    } catch (e) {
        console.error('❌ AI Auto-reply error:', e.message);
    }
});
