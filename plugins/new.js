// External modules required for the commands
const { mediafireDl } = require('../fredi/dl/Function');
const { ezra } = require('../fredi/ezra');
const fs = require('fs');
const getFBInfo = require('@xaviabot/fb-downloader');
const { default: axios } = require('axios');

// Command: Instagram Downloader
ezra({
    nomCom: 'insta',
    categorie: 'Download'
}, async (client, message, options) => {
    const { ms: quotedMessage, repondre, arg } = options;
    let url = arg.join(' ');

    if (!url) {
        repondre('Please insert an Instagram video link');
        return;
    }

    try {
        const apiResponse = await fetch(`https://api.maher-zubair.xyz/download/instagram?url=${url}`);
        const data = await apiResponse.json();

        if (data && data.result && data.result.data && data.result.data.length > 0) {
            const media = data.result.data[0];
            if (media.type === 'video') {
                client.sendMessage(client, {
                    video: { url: media.url },
                    caption: 'Here is your Instagram Video.\n _Downloaded by_ *QADEER-AI*',
                    gifPlayback: false
                }, { quoted: quotedMessage });
            } else {
                client.sendMessage(client, {
                    image: { url: media.url },
                    caption: 'Here is your Instagram Image!\n _Downloaded by_ *QADEER-AI*'
                });
            }
        } else {
            throw new Error('No media found in the response data');
        }
    } catch (error) {
        console.error('An error occurred while downloading your media.', error);
    }
});

// Command: Twitter Downloader
ezra({
    nomCom: 'twitter',
    categorie: 'Download'
}, async (client, message, options) => {
    const { ms: quotedMessage, repondre, arg } = options;
    let url = arg.join(' ');

    if (!url) {
        repondre('Please insert a *TWITTER Video Link* for *QADEER-AI* to download ');
        return;
    }

    try {
        const apiResponse = await fetch(`https://api.maher-zubair.xyz/download/twitter?url=${url}`);
        const result = await apiResponse.json();
        
        if (result && result.data && result.data.HD) {
            const videoUrl = result.data.HD;
            message.sendMessage(client, {
                video: { url: videoUrl },
                caption: 'Here is your Twitter Video.\n _Downloaded by_ *QADEER-AI*',
                gifPlayback: false
            }, { quoted: quotedMessage });
        }
    } catch (error) {
        repondre('I am unable to download your media.\n ' + error);
    }
});

// Command: TikTok Downloader
// Note: Original code had a typo "france", it should be "ezra".
ezra({
    nomCom: 'tiktok',
    categorie: 'Download'
}, async (client, message, options) => {
    const { ms: quotedMessage, repondre, arg } = options;
    let url = arg.join(' ');

    if (!url) {
        repondre('Please insert a Tik Tok video link');
        return;
    }

    const apiResponse = await fetch(`https://api.maher-zubair.xyz/download/tiktok2?url=${url}`);
    const data = await apiResponse.json();

    try {
        if (data && data.result && data.result.url && data.result.url.nowm) {
            const videoUrl = data.result.url.nowm;
            message.sendMessage(client, {
                video: { url: videoUrl },
                caption: 'Here is your Tiktok Video.\n _Downloaded by_ *QADEER-AI*',
                gifPlayback: false
            }, { quoted: quotedMessage });
        }
    } catch (error) {
        repondre('I am unable to download the file.\n ' + error);
    }
});

// Command: Mediafire Downloader
ezra({
    nomCom: 'mediafire',
    categorie: 'Download'
}, async (client, message, options) => {
    const { ms: quotedMessage, repondre, arg } = options;
    let url = arg.join(' ');

    if (!url) {
        repondre('Provide mediafire link\n\nmediafire <valid mediafire link>');
        return;
    }

    try {
        const fileData = await mediafireDl(url);
        if (fileData[0].size.split('MB')[0] >= 100) {
            return message.reply('File tooooo big');
        }
        await message.sendMessage(client, {
            document: { url: fileData[0].link },
            fileName: fileData[0].nama,
            mimetype: fileData[0].mime,
            caption: 'Downloaded by QADEER-AI: ' + fileData[0].nama
        }, { quoted: quotedMessage });
    } catch (error) {
        repondre('I am unable to download the file.\n ' + error);
    }
});

// Command: Facebook Downloader (HD)
ezra({
    nomCom: 'fbdl',
    categorie: 'Download',
    reaction: '🎞️'
}, async (client, message, options) => {
    const { repondre, ms: quotedMessage, arg } = options;
    if (!arg[0]) {
        repondre('Insert a public facebook video link!');
        return;
    }
    const url = arg.join(' ');

    try {
        getFBInfo(url)
            .then(result => {
                let captionText = '\n           titre: ' + result.title + '\n         Lien: ' + result.url + '\n       ';
                message.sendMessage(client, {
                    image: { url: result.thumbnail },
                    caption: captionText
                }, { quoted: quotedMessage });
                message.sendMessage(client, {
                    video: { url: result.hd },
                    caption: 'facebook video downloader\n powered by *QADEER-AI*'
                }, { quoted: quotedMessage });
            })
            .catch(error => {
                console.log('Error:', error);
                repondre('try fbdl2 on this link');
            });
    } catch (error) {
        console.error('An error occurred while QADEER-AI was downloading your media:', error);
        repondre('An error occurred while downloading your media.', error);
    }
});


// Command: Facebook Downloader (SD)
// Note: Original code had a typo "france", it should be "ezra".
ezra({
    nomCom: 'fbdl2',
    categorie: 'Download',
    reaction: '🎞️'
}, async (client, message, options) => {
    const { repondre, ms: quotedMessage, arg } = options;
    if (!arg[0]) {
        repondre('Insert a public facebook video link! !');
        return;
    }
    const url = arg.join(' ');
    
    try {
        getFBInfo(url)
            .then(result => {
                let captionText = '\n         titre: ' + result.title + '\n         Lien: ' + result.url + '\n       ';
                message.sendMessage(client, {
                    image: { url: result.thumbnail },
                    caption: captionText
                }, { quoted: quotedMessage });
                message.sendMessage(client, {
                    video: { url: result.sd },
                    caption: 'facebook video downloader powered by *QADEER-AI*'
                }, { quoted: quotedMessage });
            })
            .catch(error => {
                console.log('Error:', error);
                repondre(error.toString());
            });
    } catch (error) {
        console.error('An error occurred while QADEER-AI was downloading your media:', error);
        repondre('An error occurred while QADEER-AI was downloading your media. ' + error);
    }
});
