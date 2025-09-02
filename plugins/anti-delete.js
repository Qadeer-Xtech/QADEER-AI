const axios = require('axios');
const config = require('../config');
const { cmd, commands } = require('../command');
const util = require('util');
const { getAnti, setAnti, initializeAntiDeleteSettings } = require('../data/antidel');

// Initialize the anti-delete settings on startup
initializeAntiDeleteSettings();

cmd({
    pattern: 'antidelete',
    alias: ['antidel', 'anti-delete'],
    desc: 'Sets up the AntiDelete system to recover deleted messages.',
    category: 'misc',
    use: '\n.antidelete on       - Turns on antidelete for all chats\n.antidelete off      - Turns off antidelete for all chats\n.antidelete status   - Show current status\n    ',
    filename: __filename
}, async (sock, m, store, { from, reply, q, text, isTofan, fromMe }) => {
    if (!isTofan) {
        return reply('T*📛 This command is restricted to owners only.*');
    }

    try {
        const option = q?.toLowerCase();

        switch (option) {
            case 'on':
                await setAnti('gc', true);
                await setAnti('dm', true);
                return reply('✅ Anti-delete has been enabled');

            case 'off':
                await setAnti('gc', false);
                await setAnti('dm', false);
                return reply('❌ Anti-delete has been disabled');

            case 'status':
                const dmStatus = await getAnti('dm');
                const gcStatus = await getAnti('gc');
                return reply(
                    '_AntiDelete Status_\n\n' +
                    '*DM AntiDelete:* ' + (dmStatus ? 'Enabled' : 'Disabled') + '\n' +
                    '*Group Chat AntiDelete:* ' + (gcStatus ? 'Enabled' : 'Disabled')
                );

            default:
                const helpText = '-- *AntiDelete Command Guide* --\n' +
                    '• `.antidelete on` - Enable AntiDelete for all chats\n' +
                    '• `.antidelete off` - Disable AntiDelete for all chats\n' +
                    '• `.antidelete status` - Show current status';
                return reply(helpText);
        }
    } catch (error) {
        console.error('Error in antidelete command:', error);
        return reply('An error occurred while processing your request.');
    }
});

cmd({
    pattern: 'vv3',
    alias: ['retrive', '🔥'],
    desc: 'Fetch and resend a ViewOnce message content (image/video).',
    category: 'misc',
    use: '<query>',
    filename: __filename
}, async (sock, m, store, { from, reply }) => {
    try {
        const quotedMsg = store.quoted?.message?.quotedMessage;

        if (quotedMsg && quotedMsg.viewOnceMessageV2) {
            const voMessage = quotedMsg.viewOnceMessageV2;

            if (voMessage.message.imageMessage) {
                let caption = voMessage.message.imageMessage.caption;
                let mediaUrl = await sock.downloadAndSaveMediaMessage(voMessage.message.imageMessage);
                return sock.sendMessage(from, { image: { url: mediaUrl }, caption: caption }, { quoted: m });
            }
            if (voMessage.message.videoMessage) {
                let caption = voMessage.message.videoMessage.caption;
                let mediaUrl = await sock.downloadAndSaveMediaMessage(voMessage.message.videoMessage);
                return sock.sendMessage(from, { video: { url: mediaUrl }, caption: caption }, { quoted: m });
            }
            if (voMessage.message.audioMessage) {
                let mediaUrl = await sock.downloadAndSaveMediaMessage(voMessage.message.audioMessage);
                return sock.sendMessage(from, { audio: { url: mediaUrl }}, { quoted: m });
            }
        }

        if (!store.quoted) {
            return reply('Please reply to a ViewOnce message.');
        }

        if (store.quoted.mtype === 'viewOnceMessage') {
            if (store.quoted.message.imageMessage) {
                let caption = store.quoted.message.imageMessage.caption;
                let mediaUrl = await sock.downloadAndSaveMediaMessage(store.quoted.message.imageMessage);
                return sock.sendMessage(from, { image: { url: mediaUrl }, caption: caption }, { quoted: m });
            } else if (store.quoted.message.videoMessage) {
                let caption = store.quoted.message.videoMessage.caption;
                let mediaUrl = await sock.downloadAndSaveMediaMessage(store.quoted.message.videoMessage);
                return sock.sendMessage(from, { video: { url: mediaUrl }, caption: caption }, { quoted: m });
            }
        } else if (store.quoted.message.audioMessage) {
             let mediaUrl = await sock.downloadAndSaveMediaMessage(store.quoted.message.audioMessage);
             return sock.sendMessage(from, { audio: { url: mediaUrl } }, { quoted: m });
        } else {
            return reply('This is not a ViewOnce message.');
        }
    } catch (error) {
        console.log('Error:', error);
        reply('An error occurred while fetching the ViewOnce message.');
    }
});
