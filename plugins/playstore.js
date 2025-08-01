// Zaroori libraries ko import kiya ja raha hai
const gis = require("g-i-s"); // Yeh library Play Store se app search karne ke liye istemal ho rahi hai
const {
    smd
} = require("../lib"); // Command register karne ke liye ek custom function
const Client = require("ssh2-sftp-client"); // Note: Yeh library import hai lekin code mein istemal nahi ho rahi

// 'apk' command ko register kiya ja raha hai
smd({
    pattern: "apk",
    alias: ["getapk"],
    desc: "download apks from playstore",
    filename: __filename,
    react: "⬇️",
    category: "downloader",
}, async (bot, message, text, {
    jid,
    sendReact,
    reply
}) => {
    try {
        // Check karna ke user ne app ka naam diya hai ya nahi
        if (!text) {
            return reply("Please provide the name of an app to download!");
        }

        // User ko batana ke search shuru ho gayi hai
        await sendReact("searching");

        // App search karne ke liye API URL tayyar karna
        const searchUrl = `https://g-i-s.vercel.app/api/google/play?query=${text}`;
        const {
            result: searchResult
        } = await gis(searchUrl);

        // Agar app na mile to user ko batana
        if (!searchResult ? .list ? .length) {
            return reply("No results found for that app name!");
        }

        const appDetails = searchResult.list[0];

        // App ki details ko ek caption mein format karna
        const fileSize = (appDetails.size / 1048576).toFixed(2); // Bytes ko MB mein convert karna
        const caption = `*APP NAME:* ${appDetails.name}\n*APP ID:* ${appDetails.appId}\n*SIZE:* ${fileSize}MB\n*LAST UPDATED:* ${appDetails.updated}\n*DEVELOPER:* ${appDetails.developer}`;

        // User ko batana ke downloading shuru ho gayi hai
        await sendReact("downloading");

        // App ka icon aur details user ko bhejna
        await bot.sendMessage(
            jid, {
                image: {
                    url: appDetails.icon
                },
                mimetype: "image/jpeg",
                caption: caption,
                contextInfo: {
                    externalAdReply: {
                        title: "APK DOWNLOADER",
                        body: "Powered by Qadeer-AI",
                        mediaType: 1,
                        thumbnailUrl: appDetails.icon,
                        sourceUrl: "https://wa.me/923151105391",
                        mediaUrl: appDetails.url,
                        renderLargerThumbnail: true,
                        showAdAttribution: true,
                    },
                },
            }, {
                quoted: message
            }
        );

        // APK file ko document ke taur par bhejna
        await sendReact("uploading");
        await bot.sendMessage(
            jid, {
                document: {
                    url: appDetails.url
                },
                mimetype: "application/vnd.android.package-archive",
                fileName: `${appDetails.name}.apk`,
                caption: caption,
                contextInfo: {
                    externalAdReply: {
                        title: "APK DOWNLOADER",
                        body: "Powered by Qadeer-AI",
                        mediaType: 1,
                        thumbnailUrl: appDetails.icon,
                        sourceUrl: "https://wa.me/923151105391",
                        mediaUrl: appDetails.url,
                        renderLargerThumbnail: true,
                        showAdAttribution: true,
                    },
                },
            }, {
                quoted: message
            }
        );

    } catch (error) {
        console.error(error);
        reply("An error occurred while trying to download the APK.");
    }
});
