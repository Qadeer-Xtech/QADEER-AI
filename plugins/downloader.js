const {
    mediafireDl
} = require('../fr-dl/mediafire-dl');
const {
    ezra
} = require('../fr-dl/lib');
const getFBInfo = require('@xaviabot/fb-downloader');

ezra({
    nomCom: "gitclone",
    categorie: "Downloader"
}, async (bot, message, context) => {
    const {
        ms,
        repondre,
        arg
    } = context;
    const url = arg.join(' ');

    if (!url) {
        return repondre("Please provide a GitHub repository link!");
    }

    if (!/https|git\:\/\/(?:@)?github\.com[\/:]([^\/:]+)\/(.+)/i.test(url)) {
        return repondre("Please provide a valid GitHub repository link!");
    }

    let [, user, repo] = url.match(/(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i) || [];
    repo = repo.replace(/.git$/, '');
    let zip_url = `https://api.github.com/repos/${user}/${repo}/zipball/main`;

    const filename = (await fetch(zip_url, {
        method: 'HEAD'
    })).headers.get('content-disposition').split('attachment; filename=')[1];

    await bot.sendMessage(bot, {
        document: {
            url: zip_url
        },
        fileName: filename,
        mimetype: 'application/zip'
    }, {
        quoted: ms
    }).catch(e => repondre("Error occurred..."));
});

ezra({
    nomCom: "ig",
    categorie: "Downloader"
}, async (bot, message, context) => {
    const {
        ms,
        repondre,
        arg
    } = context;
    let url = arg.join(' ');

    if (!url) {
        return repondre("Please provide an Instagram video or image link!");
    }

    const response = await fetch(`https://guruged.app/v1/insta?url=${url}`);
    const data = await response.json();
    await repondre("Downloading your Instagram media...");

    const media = data.result[0];

    bot.sendMessage(bot, {
        video: {
            url: media
        },
        caption: "𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*",
        gifPlayback: true
    }, {
        quoted: ms
    });
});

(function() {
    function _f66fca(_0x5a8dcd) {
        // Anti-debugger logic was here
    }
    try {
        if (true) return _f66fca;
        else _f66fca(0);
    } catch (e) {}
}());

ezra({
    nomCom: "twitter",
    categorie: "Downloader"
}, async (bot, message, context) => {
    const {
        ms,
        repondre,
        arg
    } = context;
    let url = arg.join(' ');

    if (!url) {
        return repondre("*Please provide a Twitter video link!*");
    }

    try {
        let response = await fetch(`https://api.guruapi.tech/api/twitterdl?url=${url}`);
        const data = await response.json();
        const videoUrl = data.result.media[0].url;

        bot.sendMessage(bot, {
            video: {
                url: videoUrl
            },
            caption: "*Here is your Twitter video 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*",
            gifPlayback: true
        }, {
            quoted: ms
        });
    } catch (e) {
        repondre("*An error occurred while processing your request. Please check the link and try again.*");
    }
});

ezra({
    nomCom: "tiktok",
    categorie: "Downloader"
}, async (bot, message, context) => {
    const {
        ms,
        repondre,
        arg
    } = context;
    let url = arg.join(' ');

    if (!url) {
        return repondre("Please provide a TikTok video link!");
    }

    try {
        const response = await fetch(`https://api.guruapi.tech/api/tiktokdl?url=${url}`);
        const data = await response.json();
        const videoUrl = data.result.video_no_watermark;

        bot.sendMessage(bot, {
            video: {
                url: videoUrl
            },
            caption: "*Here is your TikTok video.*\n_𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*",
            gifPlayback: true
        }, {
            quoted: ms
        });
    } catch (e) {
        repondre(`*An error occurred:*\n${e}`);
    }
});

ezra({
    nomCom: "mediafire",
    categorie: "Downloader"
}, async (bot, message, context) => {
    const {
        ms,
        repondre,
        arg
    } = context;
    let url = arg.join(' ');

    if (!url) {
        return repondre("Please provide a MediaFire link to download.");
    }

    try {
        const fileData = await mediafireDl(url);

        if (parseInt(fileData[0].size.replace('MB', '')) > 1000) {
            return m.reply("File is too large to download.");
        }

        const details = `
*MEDIAFIRE DOWNLOAD*

*Title:* ${fileData[0].nama}
*Size:* ${fileData[0].size}
*Link:* ${fileData[0].link}

_Downloading media, please wait..._
`;
        repondre(details);

        await bot.sendMessage(bot, {
            document: {
                url: fileData[0].link
            },
            fileName: fileData[0].nama,
            mimetype: fileData[0].mime,
            caption: "*𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*"
        }, {
            quoted: ms
        });
    } catch (e) {
        repondre(`*An error occurred while trying to download from MediaFire.* \n_Error: ${e}_`);
    }
});

ezra({
    nomCom: "fb",
    categorie: "Downloader",
    reaction: "💿"
}, async (bot, message, context) => {
    const {
        repondre,
        ms,
        arg
    } = context;

    if (!arg[0]) {
        return repondre("Please provide a Facebook video link!");
    }

    const url = arg.join(' ');

    try {
        getFBInfo(url).then(result => {
                let caption = `
*FACEBOOK DOWNLOAD*

*Title:* ${result.title}

_Downloading video, please wait..._
`;
                bot.sendMessage(bot, {
                    video: {
                        url: result.url
                    },
                    caption: caption
                }, {
                    quoted: ms
                });

                bot.sendMessage(bot, {
                    audio: {
                        url: result.audio
                    },
                    mimetype: 'audio/mp4'
                }, {
                    quoted: ms
                });
            })
            .catch(error => {
                console.log("Error:", error);
                repondre(error);
            });
    } catch (e) {
        console.log("Error:", e);
        repondre("An error occurred: " + e, );
    }
});

ezra({
    nomCom: "ytv",
    categorie: "Downloader",
    reaction: "🎥"
}, async (bot, message, context) => {
    const {
        repondre,
        ms,
        arg
    } = context;

    if (!arg[0]) {
        return repondre("Please provide a YouTube video link!");
    }

    const url = arg.join(' ');

    try {
        getFBInfo(url)
            .then(result => {
                let caption = `
*YOUTUBE DOWNLOAD*

*Title:* ${result.title}
*ID:* ${result.id}

_Downloading video, please wait..._
`;
                bot.sendMessage(bot, {
                    video: {
                        url: result.url
                    },
                    caption: caption
                }, {
                    quoted: ms
                });

                bot.sendMessage(bot, {
                    audio: {
                        url: result.audio
                    },
                    mimetype: 'audio/mp4'
                }, {
                    quoted: ms
                });
            })
            .catch(error => {
                console.log("Error:", error);
                repondre(error);
            });
    } catch (e) {
        console.log("Error:", e);
        repondre("An error occurred: ", e);
    }
});
