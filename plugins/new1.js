const {
    ezra
} = require('../frame/ezra.js');
const {
    default: axios
} = require('axios');

// Command: bing
ezra({
    cmdName: "bing",
    category: "AI",
    desc: "Generates image with bing.",
    use: "bing <prompt>",
    alias: ["bingimg"],
    react: "🛰️",
    filename: __filename,
    limit: true
}, async (client, message, {
    arg,
    repondre
}) => {
    try {
        if (!arg) return repondre("Please provide a prompt to generate an image.");
        await repondre("Please wait, generating your image...");
        const {
            data
        } = await axios.get(`https://vihangayt.me/tools/bing?q=${arg}`);
        if (!data || !data.status) return repondre("Sorry, could not generate the image.");

        const images = data.data;
        for (let i = 0; i < images.length; i++) {
            await client.sendMessage(message.chat, {
                image: {
                    url: images[i]
                },
                caption: `*Generated with Bing*`
            }, {
                quoted: message
            });
        }
    } catch (e) {
        console.error("Error in bing command:", e);
        repondre("Oops, an error occurred while processing your request.");
    }
});

// Command: dalle
ezra({
    cmdName: "dalle",
    category: "AI",
    desc: "Generates image with DALL-E.",
    use: "dalle <prompt>",
    alias: ["dalleimg"],
    react: "🛰️",
    filename: __filename,
    limit: true
}, async (client, message, {
    arg,
    repondre
}) => {
    try {
        if (!arg) return repondre("Please provide a prompt to generate an image.");
        await repondre("Please wait, generating your image...");
        const {
            data
        } = await axios.get(`https://vihangayt.me/tools/dalle?q=${arg}`);
        if (!data || !data.status) return repondre("Sorry, could not generate the image.");
        
        await client.sendMessage(message.chat, {
            image: {
                url: data.data
            },
            caption: "*Generated with DALL-E*"
        }, {
            quoted: message
        });
    } catch (e) {
        console.error("Error in dalle command:", e);
        repondre("Oops, an error occurred while processing your request.");
    }
});

// Command: imagine
ezra({
    cmdName: "imagine",
    category: "AI",
    desc: "Generates image with imagine.",
    use: "imagine <prompt>",
    alias: ["genimg"],
    react: "🛰️",
    filename: __filename,
    limit: true
}, async (client, message, {
    arg,
    repondre
}) => {
    try {
        if (!arg) return repondre("Please provide a prompt to generate an image.");
        await repondre("Please wait, generating your image...");
        const {
            data
        } = await axios.get(`https://vihangayt.me/tools/imagine?q=${arg}`);
        if (!data || !data.status) return repondre("Sorry, could not generate the image.");
        
        await client.sendMessage(message.chat, {
            image: {
                url: data.data
            },
            caption: "*Generated with Imagine AI*"
        }, {
            quoted: message
        });
    } catch (e) {
        console.error("Error in imagine command:", e);
        repondre("Oops, an error occurred while processing your request.");
    }
});

// Command: removebg
ezra({
    cmdName: "removebg",
    category: "converter",
    desc: "Removes background from an image.",
    use: "removebg <reply to an image>",
    react: "🛰️",
    filename: __filename,
    limit: true
}, async (client, message, {
    repondre
}) => {
    try {
        const quoted = message.quoted ? message.quoted : message;
        const mime = quoted.mtype;
        if (!/image/.test(mime)) return repondre("Please reply to an image to remove its background.");
        
        await repondre("Removing background, please wait...");
        const image = await quoted.download();
        const {
            data
        } = await axios.get(`https://vihangayt.me/tools/removebg?url=${image}`);
        if (!data || !data.status) return repondre("Sorry, could not remove the background.");
        
        await client.sendMessage(message.chat, {
            image: {
                url: data.data.url
            },
            caption: "*Background Removed Successfully*"
        }, {
            quoted: message
        });
    } catch (e) {
        console.error("Error in removebg command:", e);
        repondre("Oops, an error occurred while processing your request.");
    }
});

// Command: tiktok
ezra({
    cmdName: "tiktok",
    category: "downloader",
    desc: "Downloads video from TikTok.",
    use: "tiktok <url>",
    alias: ["tk", "tktok"],
    react: "🛰️",
    filename: __filename,
    limit: true
}, async (client, message, {
    arg,
    repondre
}) => {
    try {
        if (!arg) return repondre("Please provide a TikTok video URL.");
        await repondre("Downloading your TikTok video, please wait...");
        const {
            data
        } = await axios.get(`https://vihangayt.me/download/tiktok?url=${arg}`);
        if (!data || !data.status) return repondre("Sorry, could not download the video.");
        
        const videoUrl = data.data.links[0].url;
        const caption = `*${data.data.desc}*`;
        
        await client.sendMessage(message.chat, {
            video: {
                url: videoUrl
            },
            caption: caption
        }, {
            quoted: message
        });
    } catch (e) {
        console.error("Error in tiktok command:", e);
        repondre("Oops, an error occurred while processing your request.");
    }
});
