// Zaroori libraries ko import kiya ja raha hai
const { cmd } = require("../command");
const axios = require("axios");
const moment = require("moment-timezone");

// Maujooda waqt (Pakistan timezone ke mutabiq) hasil karne ka function
const getTimeNow = () => moment().tz("Asia/Karachi").format("HH:mm:ss");

// WhatsApp messages ke liye ek custom reply style banane ka function
const getContextInfo = (title, sourceUrl, thumbnailUrl) => ({
    externalAdReply: {
        showAdAttribution: true,
        title: title,
        body: "QADEER-AI | Multi-Device WhatsApp Bot",
        thumbnailUrl: thumbnailUrl || "https://qu.ax/Pusls.jpg",
        sourceUrl: sourceUrl || "https://github.com/Qadeer-Xtech/QADEER-AI",
    },
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: "120363345872435489@newsletter",
        newsletterName: "QADEER-AI Updates",
    },
});

// Bot ke baare mein aam sawalon ke liye pehle se tayyar jawab
const customReplies = (query) => {
    const lowerCaseQuery = query.toLowerCase();
    const now = moment().tz("Asia/Karachi");

    if (lowerCaseQuery.includes("qadeer-ai")) {
        return "🔥 QADEER-AI is a Multi-Device WhatsApp Bot made by *QADEER-KHAN*.";
    }
    if (lowerCaseQuery.includes("qadeerkhan")) {
        return "👑 QADEER-KHAN is the official creator of the *QADEER-AI* WhatsApp bot.";
    }
    if (lowerCaseQuery.includes("channel")) {
        return "📢 Official channel: https://whatsapp.com/channel/0029Vaw6yRaBPzjZPtVtA80A";
    }
    if (lowerCaseQuery.includes("repo") || lowerCaseQuery.includes("github")) {
        return "🔗 GitHub repo: https://github.com/Qadeer-Xtech/QADEER-AI";
    }
    if (lowerCaseQuery.includes("date") || lowerCaseQuery.includes("today")) {
        return `📅 Today is *${now.format("dddd, MMMM Do YYYY")}*`;
    }
    if (lowerCaseQuery.includes("day")) {
        return `📆 Today is *${now.format("dddd")}*`;
    }
    if (lowerCaseQuery.includes("time") || lowerCaseQuery.includes("clock")) {
        return `⏰ Time in Pakistan: *${getTimeNow()}*`;
    }
    return null; // Agar koi custom jawab na ho to null return karein
};

// Command 1: .ai (General AI)
cmd({
    pattern: "ai",
    alias: ["gpt", "dj", "gpt4", "bing"],
    desc: "Chat with an AI model",
    category: "ai",
    react: "🤖",
    filename: __filename,
}, async (bot, message, text, {
    q,
    reply
}) => {
    try {
        if (!q) {
            return reply("Please provide a message for the AI.\nExample: `.ai Hello`");
        }

        const customReply = customReplies(q);
        if (customReply) {
            return bot.sendMessage(message.chat, {
                text: customReply,
                contextInfo: getContextInfo("AI Response"),
            });
        }

        const response = await axios.get(`https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`);
        if (!response.data || !response.data.result) {
            return reply("AI failed to respond.");
        }

        const time = getTimeNow();
        return bot.sendMessage(message.chat, {
            text: `🤖 *AI Response:*\n\n${response.data.result}\n\n⏰ *Time:* ${time}`,
            contextInfo: getContextInfo("AI Response"),
        });

    } catch (error) {
        console.error("AI Error:", error);
        reply("❌ Error occurred.");
    }
});

// Command 2: .openai (OpenAI specific model)
cmd({
    pattern: "openai",
    alias: ["gpt3", "chatgpt", "open-gpt"],
    desc: "Chat with OpenAI",
    category: "ai",
    react: "🧠",
    filename: __filename,
}, async (bot, message, text, {
    q,
    reply
}) => {
    try {
        if (!q) {
            return reply("Please provide a message for OpenAI.\nExample: `.openai Hello`");
        }

        const customReply = customReplies(q);
        if (customReply) {
            return bot.sendMessage(message.chat, {
                text: customReply,
                contextInfo: getContextInfo("OpenAI Response"),
            });
        }

        const response = await axios.get(`https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`);
        if (!response.data || !response.data.result) {
            return reply("OpenAI failed to respond.");
        }

        const time = getTimeNow();
        return bot.sendMessage(message.chat, {
            text: `🧠 *OpenAI Response:*\n\n${response.data.result}\n\n⏰ *Time:* ${time}`,
            contextInfo: getContextInfo("OpenAI Response"),
        });

    } catch (error) {
        console.error("OpenAI Error:", error);
        reply("❌ Error occurred.");
    }
});

// Command 3: .deepseek (DeepSeek AI model)
cmd({
    pattern: "deepseek",
    alias: ["deep", "seekai"],
    desc: "Chat with DeepSeek AI",
    category: "ai",
    react: "🧠",
    filename: __filename,
}, async (bot, message, text, {
    q,
    reply
}) => {
    try {
        if (!q) {
            return reply("Please provide a message for DeepSeek AI.\nExample: `.deepseek Hello`");
        }

        const customReply = customReplies(q);
        if (customReply) {
            return bot.sendMessage(message.chat, {
                text: customReply,
                contextInfo: getContextInfo("DeepSeek Response"),
            });
        }

        const response = await axios.get(`https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`);
        if (!response.data || !response.data.answer) {
            return reply("DeepSeek failed to respond.");
        }

        const time = getTimeNow();
        return bot.sendMessage(message.chat, {
            text: `🧠 *DeepSeek AI Response:*\n\n${response.data.answer}\n\n⏰ *Time:* ${time}`,
            contextInfo: getContextInfo("DeepSeek Response"),
        });

    } catch (error) {
        console.error("DeepSeek Error:", error);
        reply("❌ Error occurred.");
    }
});
