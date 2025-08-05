'use strict';

// Helper functions for module loading (from TypeScript/Babel)
var __createBinding = (this && this.__createBinding) || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for (var k in mod)
            if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    }
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function(mod) {
    return (mod && mod.__esModule) ? mod : {
        "default": mod
    };
};

Object.defineProperty(exports, "__esModule", {
    value: true
});

// Core Dependencies
const baileys_1 = __importStar(require('@whiskeysockets/baileys'));
const logger_1 = __importDefault(require('@whiskeysockets/baileys/lib/Utils/logger'));
const logger = logger_1.default.child({});
logger.level = 'silent';
const pino = require('pino');
const {
    Boom
} = require('@hapi/boom');
const conf = require('./set');
const axios = require('axios');
let fs = require('fs-extra');
let path = require('path');
const FileType = require('file-type');
const {
    Sticker,
    createSticker,
    StickerTypes
} = require('wa-sticker-formatter');

// Custom Database and Module Imports
const {
    verifierEtatJid,
    recupererActionJid
} = require('./lib/antilien');
const {
    atbverifierEtatJid,
    atbrecupererActionJid
} = require('./lib/antibot');
let evt = require(__dirname + '/plugins');
const {
    isUserBanned,
    addUserToBanList,
    removeUserFromBanList
} = require('./lib/banUser');
const {
    addGroupToBanList,
    isGroupBanned,
    removeGroupFromBanList
} = require('./lib/banGroup');
const {
    isGroupOnlyAdmin,
    addGroupToOnlyAdminList,
    removeGroupFromOnlyAdminList
} = require('./lib/onlyAdmin');
let {
    reagir
} = require(__dirname + '/fonction');

// Bot Configuration
var session = conf.SESSION_ID.replace(/Qadeer~, '');
const prefixe = conf.PREFIXE;
const more = String.fromCharCode(8206);
const readmore = more.repeat(4001);
const BaseUrl = process.env.GITHUB_GIT;
const ezraapikey = process.env.BAES;

// --- Session Authentication ---
async function authentification() {
    try {
        if (!fs.existsSync(__dirname + '/scan/creds.json')) {
            console.log('Session ID error, please rescan.');
            await fs.writeFileSync(__dirname + '/scan/creds.json', atob(session), 'utf8');
        } else if (fs.existsSync(__dirname + '/scan/creds.json') && session != 'zokk') {
            await fs.writeFileSync(__dirname + '/scan/creds.json', atob(session), 'utf8');
        }
    } catch (e) {
        console.log('Session Invalid: ' + e);
        return;
    }
}
authentification();

const store = (0, baileys_1.makeInMemoryStore)({
    'logger': pino().child({
        'level': 'silent',
        'stream': 'store'
    })
});

setTimeout(() => {
    authentification();
    
    async function startQadeerBot() {
        const {
            version,
            isLatest
        } = await (0, baileys_1.fetchLatestBaileysVersion)();
        const {
            state,
            saveCreds
        } = await (0, baileys_1.useMultiFileAuthState)(__dirname + '/scan');

        const sockOptions = {
            version: version,
            logger: pino({
                'level': 'silent'
            }),
            browser: ['Qadeer-Md', 'safari', '1.0.0'],
            printQRInTerminal: true,
            fireInitQueries: false,
            shouldSyncHistoryMessage: true,
            downloadHistory: true,
            syncFullHistory: true,
            generateHighQualityLinkPreview: true,
            markOnlineOnConnect: false,
            keepAliveIntervalMs: 30000,
            auth: {
                creds: state.creds,
                keys: (0, baileys_1.makeCacheableSignalKeyStore)(state.keys, logger)
            },
            getMessage: async key => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id, undefined);
                    return msg.message || undefined;
                }
                return {
                    'conversation': 'Doing nothing'
                };
            }
        };

        const sock = (0, baileys_1.default)(sockOptions);
        store.bind(sock.ev);

        // --- Auto Bio Updater ---
        function getCurrentTime() {
            const options = {
                timeZone: 'Asia/Karachi',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            const formatter = new Intl.DateTimeFormat('en-US', options);
            return formatter.format(new Date());
        }

        setInterval(async () => {
            if (conf.AUTO_BIO === 'yes') {
                const currentTime = getCurrentTime();
                const bio = `Qadeer is Online 🕸\n\n` + currentTime;
                await sock.updateProfileStatus(bio);
                console.log('Updated Bio: ' + bio);
            }
        }, 60000);

        // --- ANTI_CALL Feature ---
        sock.ev.on('call', async (call) => {
            if (conf.ANTI_CALL === 'yes') {
                const callerId = call[0].from;
                const callerName = call[0].notify;
                await sock.rejectCall(call[0].id, callerId);
                await sock.updateBlockStatus(callerId, 'block');
            }
        });

        // --- Auto Reaction Logic ---
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        let lastReactionTime = 0;

        const reactionKeywords = {
            'hello': ['👋', '🙂', '😊', '🙋‍♂️', '🙋‍♀️'],
            'thanks': ['🙏', '😊', '💖', '❤️', '💐'],
            'love': ['❤️', '💖', '💘', '😍', '😘', '💍', '💑'],
            'bye': ['👋', '😢', '🚶‍♂️', '🥲', '🚶‍♀️', '🙇‍♂️'],
            'bot': ['🤖', '💻', '⚙️', '🧠', '🔧'],
        };
        
        const randomEmojis = ['😎', '🔥', '💥', '💯', '✨', '🌟', '🌈', '⚡', '💎', '👑'];

        const getReactionForText = (text) => {
            const words = text.split(/\s+/);
            for (const word of words) {
                const emojiList = reactionKeywords[word.toLocaleLowerCase()];
                if (emojiList) {
                    return emojiList[Math.floor(Math.random() * emojiList.length)];
                }
            }
            return getRandomReaction();
        };

        const getRandomReaction = () => {
            return randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
        };

        if (conf.AUTO_REACT_STATUS === 'yes') {
            console.log('AUTO_REACT_STATUS is enabled. Listening for status updates...');
            sock.ev.on('messages.upsert', async ({ messages }) => {
                for (const msg of messages) {
                    if (msg.key && msg.key.remoteJid === 'status@broadcast') {
                        console.log('Detected status update from:', msg.key.remoteJid);
                        const now = Date.now();
                        if (now - lastReactionTime < 5000) {
                            console.log('Throttling reactions to prevent overflow.');
                            continue;
                        }

                        const botId = sock.user && sock.user.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : null;
                        if (!botId) {
                            console.log("Bot's user ID not available. Skipping reaction.");
                            continue;
                        }

                        const statusText = msg?.message?.conversation || '';
                        const reaction = getReactionForText(statusText) || getRandomReaction();
                        
                        if (reaction) {
                            await sock.sendMessage(msg.key.remoteJid, { react: { key: msg.key, text: reaction } }, { statusJidList: [msg.key.participant, botId] });
                            lastReactionTime = Date.now();
                            console.log(`Successfully reacted with '${reaction}' to status update by ${msg.key.remoteJid}`);
                        }
                        await delay(2000);
                    }
                }
            });
        }
        
        if (conf.AUTO_REACT === 'yes') {
            console.log('AUTO_REACT is enabled. Listening for regular messages...');
            sock.ev.on('messages.upsert', async ({ messages }) => {
                for (const msg of messages) {
                    if (msg.key && msg.key.remoteJid) {
                        const now = Date.now();
                        if (now - lastReactionTime < 5000) {
                            console.log('Throttling reactions to prevent overflow.');
                            continue;
                        }

                        const messageText = msg?.message?.conversation || '';
                        const reaction = getReactionForText(messageText) || getRandomReaction();
                        
                        if (reaction) {
                            await sock.sendMessage(msg.key.remoteJid, { react: { text: reaction, key: msg.key } })
                                .then(() => {
                                    lastReactionTime = Date.now();
                                    console.log(`Successfully reacted with '${reaction}' to message by ${msg.key.remoteJid}`);
                                }).catch(err => {
                                    console.error('Failed to send reaction:', err);
                                });
                        }
                        await delay(2000);
                    }
                }
            });
        }

        // --- Auto Save Contacts ---
        async function createVCard(jid, name) {
            try {
                const number = jid.split('@')[0];
                let contactName = name;
                
                let i = 1;
                while (Object.values(store.contacts).some(contact => contact.name === contactName)) {
                    i++;
                    contactName = name + ' ' + i;
                }

                const vCard = 'BEGIN:VCARD\n' +
                              'VERSION:3.0\n' +
                              'FN:' + contactName + '\n' +
                              'TEL;type=CELL;type=VOICE;waid=' + number + ':+'+ number + '\n' +
                              'END:VCARD\n';
                
                const vcardFile = './' + contactName + '.vcf';
                fs.writeFileSync(vcardFile, vCard);

                await sock.sendMessage(conf.NUMERO_OWNER + '@s.whatsapp.net', {
                    document: { url: vcardFile },
                    mimetype: 'text/vcard',
                    fileName: contactName + '.vcf',
                    caption: `Contact saved as ${contactName}. Please import this vCard to add the number to your contacts.\nN QADEER AI👊`
                });
                console.log(`vCard created and sent for: ${contactName} (${jid})`);
                fs.unlinkSync(vcardFile);
                return contactName;

            } catch (error) {
                console.error(`Error creating or sending vCard for ${name}:`, error.message);
            }
        }
        
        sock.ev.on('messages.upsert', async ({ messages }) => {
            if (conf.AUTO_SAVE_CONTACTS !== 'yes') return;
            const m = messages[0];
            if (!m.message) return;

            const from = m.key.remoteJid;
            const senderName = "Qadeer-Ai"; // Default name
            
            if (from.endsWith('@s.whatsapp.net') && (!store.contacts[from] || !store.contacts[from].name)) {
                const savedName = await createVCard(from, senderName);
                store.contacts[from] = { name: savedName };
                await sock.sendMessage(from, { text: `Ssup! Your name has been saved as "${savedName}" in my contact list.\n\n- QADEER-AI` });
                console.log(`Contact ${savedName} has been saved and notified.`);
            }
        });

        // --- Auto Reply ---
        let autoReplyMessage = "Hello, I'm Qadeer-AI. My owner is currently unavailable. Please leave a message, and I'll make sure they get back to you as soon as possible.";
        let repliedUsers = new Set();
        
        sock.ev.on('messages.upsert', async ({ messages }) => {
            const m = messages[0];
            if (!m.message) return;
        
            const body = m.message.conversation || m.message.extendedTextMessage?.text;
            const from = m.key.remoteJid;
        
            if (body && body.match(/^[^\w\s]/) && m.key.fromMe) {
                const prefix = body[0];
                const command = body.substring(1).split(' ')[0];
                const args = body.slice(prefix.length + command.length).trim();
                
                if (command === 'setautoreply' && args) {
                    autoReplyMessage = args;
                    await sock.sendMessage(from, { text: `Auto-reply message has been updated to:\n"${autoReplyMessage}"` });
                    return;
                }
            }
        
            if (conf.AUTO_REPLY === 'yes' && !repliedUsers.has(from) && !m.key.fromMe && !from.endsWith('@g.us')) {
                await sock.sendMessage(from, { text: autoReplyMessage });
                repliedUsers.add(from);
            }
        });

        // --- Audio Reply on Keywords ---
        const audioKeywords = {
            'heya': 'audios/hey.wav', 'hi': 'audios/hello.wav', 'hey': 'audios/hey.wav',
            'morning': 'audios/goodmorning.wav', 'night': 'audios/goodnight.wav',
            'evening': 'audios/goodevening.wav', 'afternoon': 'audios/goodafternoon.wav',
            'bot': 'audios/pk.mp3', 'qadeer': 'audios/pk.mp3', 'qadeer ai': 'audios/pk.mp3',
            'bro': 'audios/morio.mp3', 'kaka': 'audios/kaka.wav',
            'darling': 'audios/darling.wav', 'mkuu': 'audios/mkuu.wav'
        };

        const findAudioReply = (text) => {
            const words = text.split(/\s+/);
            for (const word of words) {
                const audioPath = audioKeywords[word.toLocaleLowerCase()];
                if (audioPath) return audioPath;
            }
            return null;
        };
        
        if (conf.AUDIO_REPLY === 'yes') {
            console.log('AUDIO_REPLY is enabled. Listening for messages...');
            sock.ev.on('messages.upsert', async ({ messages }) => {
                try {
                    for (const m of messages) {
                        if (!m.key || !m.key.remoteJid) continue;
                        const messageText = m?.message?.conversation || '';
                        const audioPath = findAudioReply(messageText);

                        if (audioPath) {
                            try {
                                await fs.access(audioPath);
                                console.log('Replying with audio: ' + audioPath);
                                await sock.sendMessage(m.key.remoteJid, {
                                    audio: { url: audioPath },
                                    mimetype: 'audio/mp4',
                                    ptt: true
                                });
                                console.log('Audio reply sent: ' + audioPath);
                            } catch (err) {
                                console.error('Error sending audio reply: ' + err.message);
                            }
                        }
                        await new Promise(resolve => setTimeout(resolve, 3000));
                    }
                } catch (error) {
                    console.error('Error in message processing:', error.message);
                }
            });
        }
        
        // --- Main Message Handler ---
        sock.ev.on('messages.upsert', async ({ messages }) => {
            const m = messages[0];
            if (!m.message) return;
            
            const Jid = jid => {
                if (!jid) return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = (0, baileys_1.jidDecode)(jid) || {};
                    return decode.user && decode.server && decode.user + '@' + decode.server || jid;
                } else return jid;
            };

            var mtype = (0, baileys_1.getContentType)(m.message);
            var body = (mtype === 'conversation') ? m.message.conversation :
                (mtype == 'imageMessage') ? m.message.imageMessage.caption :
                (mtype == 'videoMessage') ? m.message.videoMessage.caption :
                (mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text :
                (mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId :
                (mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
                (mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId || m.message.listResponseMessage.singleSelectReply.selectedRowId || m.text : '';

            var from = m.key.remoteJid;
            var botJid = Jid(sock.user.id);
            var botNumber = botJid.split('@')[0];
            const isGroup = from?.endsWith('@g.us');
            var groupMetadata = isGroup ? await sock.groupMetadata(from) : '';
            var groupName = isGroup ? groupMetadata.subject : '';
            var quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
            var quotedSender = Jid(m.message?.extendedTextMessage?.contextInfo?.participant);
            var mentionedJid = m.message[mtype]?.contextInfo?.mentionedJid;
            var sender = isGroup ? (m.key.participant ? m.key.participant : m.participant) : m.key.remoteJid;
            if (m.key.fromMe) { sender = botJid; }
            var pushName = m.pushName;
            
            const { getAllSudoNumbers } = require('./lib/sudo');
            const sudoNumbers = await getAllSudoNumbers();
            const allAdmins = [botNumber, '923151105391', conf.NUMERO_OWNER]
                .concat(sudoNumbers.map(n => n.replace(/[^0-9]/g) + '@s.whatsapp.net'));
            const isSudo = allAdmins.includes(sender);
            
            var groupMembers = isGroup ? groupMetadata.participants : '';
            const groupAdmins = isGroup ? groupMembers.filter(p => p.admin).map(p => p.id) : [];
            var isAdmin = isGroup ? groupAdmins.includes(sender) : false;
            var isBotAdmin = isGroup ? groupAdmins.includes(botJid) : false;
            
            const args = body ? body.trim().split(/ +/).slice(1) : null;
            const isCmd = body ? body.startsWith(prefixe) : false;
            const command = isCmd ? body.substring(1).trim().split(/ +/).shift().toLocaleLowerCase() : null;

            function reply(text) {
                sock.sendMessage(from, { text: text }, { quoted: m });
            }

            console.log("===========" + " NEW CONVERSATION " + "===========");
            console.log("\tCONSOLE MESSAGES");
            if (isGroup) {
                console.log(`MESSAGE FROM GROUP: ${groupName}`);
            }
            console.log(`MESSAGE SENT BY: [${pushName} : ${sender.split("@")[0]}]`);
            console.log("MESSAGE TYPE: " + mtype);
            console.log("------------------/-----");
            console.log(body);

            if (isCmd) {
                const cmd = evt.cm.find(c => c.nomCom === command);
                if (cmd) {
                    try {
                        if (conf.MODE.toLowerCase() != 'public' && !isSudo) return;
                        if (!isSudo && from === sender && conf.PM_PERMIT === 'yes') {
                            reply("You don't have access to commands here.");
                            return;
                        }
                        if (!isSudo && isGroup) {
                            if (await isGroupBanned(from)) return;
                        }
                        if (!isAdmin && isGroup) {
                            if (await isGroupOnlyAdmin(from)) return;
                        }
                        if (!isSudo) {
                            if (await isUserBanned(sender)) {
                                reply("You are banned from using bot commands.");
                                return;
                            }
                        }

                        cmd.fonction(from, sock, {
                            isSudo: isSudo,
                            isDev: allAdmins.includes(sender),
                            isGroup: isGroup,
                            groupMembers: groupMembers,
                            sender: sender,
                            isAdmin: isAdmin,
                            groupMetadata: groupMetadata,
                            groupName: groupName,
                            senderName: pushName,
                            botJid: botJid,
                            isBotAdmin: isBotAdmin,
                            prefix: prefixe,
                            args: args,
                            reply: reply,
                            mtype: mtype,
                            groupAdmins: groupAdmins,
                            quoted: quoted,
                            quotedSender: quotedSender,
                            m: m,
                            mybotpic: () => conf.BOT_IMAGE.split(',')[Math.floor(Math.random() * conf.BOT_IMAGE.split(',').length)]
                        });

                    } catch (e) {
                        console.log('😡😡 ' + e);
                        sock.sendMessage(from, { text: "An error occurred while executing the command:\n" + e }, { quoted: m });
                    }
                }
            }
        });

        // --- Group Participants Update Handler ---
        const { recupevents } = require('./lib/welcome');
        sock.ev.on('group-participants.update', async (update) => {
            console.log(update);
            let ppUrl;
            try {
                ppUrl = await sock.profilePictureUrl(update.id, 'image');
            } catch {
                ppUrl = 'https://qu.ax/Pusls.jpg';
            }
            
            try {
                const metadata = await sock.groupMetadata(update.id);
                
                if (update.action == 'add' && await recupevents(update.id, 'welcome') == 'on') {
                    let text = `👋 Hello,\n`;
                    for (let participant of update.participants) {
                        text += `*@${participant.split('@')[0]}* welcome to the group!`;
                    }
                    text += '\nPlease read the group description to avoid being removed.';
                    sock.sendMessage(update.id, {
                        image: { url: ppUrl },
                        caption: text,
                        mentions: update.participants
                    });
                }
                else if (update.action == 'remove' && await recupevents(update.id, 'goodbye') == 'on') {
                    let text = `A member has left the group:\n`;
                    for (let participant of update.participants) {
                        text += `@${participant.split('@')[0]}\n`;
                    }
                    sock.sendMessage(update.id, { text: text, mentions: update.participants });
                }
            } catch (err) {
                console.error(err);
            }
        });

        // --- Connection Update Handler ---
        sock.ev.on('connection.update', async (update) => {
            const { lastDisconnect, connection } = update;
            if (connection === 'connecting') {
                console.log('ℹ️ Connecting to WhatsApp...');
            } else if (connection === 'open') {
                console.log('✅ Connected to WhatsApp!');
                console.log('--');
                await (0, baileys_1.delay)(200);
                console.log('⁠⁠⁠⁠\n\n   _BOT🦚CONNECTED_');
                await (0, baileys_1.delay)(300);
                console.log('Qadeer-Ai is running 🚗\n');
                
                console.log('Loading Qadeer Commands...\n');
                fs.readdirSync(__dirname + '/plugins').forEach(file => {
                    if (path.extname(file).toLowerCase() == '.js') {
                        try {
                            require(__dirname + '/plugins/' + file);
                            console.log(file + ' Installed Successfully ✔️');
                        } catch (e) {
                            console.log(file + ' could not be installed due to: ' + e);
                        }
                        (0, baileys_1.delay)(300);
                    }
                });
                (0, baileys_1.delay)(700);
                console.log('Commands Installation Completed ✅');

            } else if (connection === 'close') {
                let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                if (reason === baileys_1.DisconnectReason.badSession) {
                    console.log('Bad Session File. Please delete the session and scan again.');
                } else if (reason === baileys_1.DisconnectReason.connectionClosed) {
                    console.log('!!! Connection closed, reconnecting...');
                    startQadeerBot();
                } else if (reason === baileys_1.DisconnectReason.connectionLost) {
                    console.log('Connection Lost from Server, trying to reconnect... ');
                    startQadeerBot();
                } else if (reason === baileys_1.DisconnectReason.connectionReplaced) {
                    console.log('Connection Replaced. Another session is already open. Please close it!');
                } else if (reason === baileys_1.DisconnectReason.loggedOut) {
                    console.log('You are logged out. Please delete the session and scan again.');
                } else if (reason === baileys_1.DisconnectReason.restartRequired) {
                    console.log('Restart required, restarting...');
                    startQadeerBot();
                } else {
                    console.log('Restarting due to an unknown error: ', reason);
                    const { exec } = require('child_process');
                    exec('pm2 restart all');
                }
            }
        });

        sock.ev.on('creds.update', saveCreds);

        return sock;
    }

    startQadeerBot();

}, 5000);

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log('Updating ' + __filename);
    delete require.cache[file];
    require(file);
});
