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
    StickerTypes
} = require('wa-sticker-formatter');

// Custom Database and Module Imports
const {
    recupevents
} = require('./lib/welcome');
let evt = require(__dirname + '/plugins');
const {
    isUserBanned
} = require('./lib/banUser');
const {
    isGroupBanned
} = require('./lib/banGroup');
const {
    isGroupOnlyAdmin
} = require('./lib/onlyAdmin');

// Bot Configuration
var session = conf.SESSION_ID.replace('Qadeer~', '');
const prefixe = conf.PREFIXE;

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
        browser: ['Qadeer-Md', 'Safari', '1.0.0'],
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

    if (conf.AUTO_BIO === 'yes') {
        setInterval(async () => {
            const currentTime = getCurrentTime();
            const bio = `Qadeer is Online 🕸\n\n${currentTime}`;
            await sock.updateProfileStatus(bio);
            console.log('Updated Bio: ' + bio);
        }, 60000); // Updates every 60 seconds
    }


    // --- GLOBAL VARIABLES FOR EVENT HANDLERS ---
    let lastReactionTime = 0;
    let repliedUsers = new Set();
    let autoReplyMessage = "Hello, I'm Qadeer-AI. My owner is currently unavailable. Please leave a message, and I'll make sure they get back to you as soon as possible.";
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    // --- EVENT HANDLERS ---

    sock.ev.on('call', async (call) => {
        if (conf.ANTI_CALL === 'yes') {
            const callerId = call[0].from;
            await sock.rejectCall(call[0].id, callerId);
            await sock.updateBlockStatus(callerId, 'block');
        }
    });

    sock.ev.on('group-participants.update', async (update) => {
        console.log(update);
        let ppUrl;
        try {
            ppUrl = await sock.profilePictureUrl(update.id, 'image');
        } catch {
            ppUrl = 'https://qu.ax/Pusls.jpg'; // A default image
        }

        try {
            if (update.action == 'add' && await recupevents(update.id, 'welcome') == 'on') {
                let text = `👋 Hello,\n`;
                for (let participant of update.participants) {
                    text += `*@${participant.split('@')[0]}* welcome to our group!`;
                }
                text += '\nPlease read the group description to avoid being removed.';
                sock.sendMessage(update.id, {
                    image: { url: ppUrl },
                    caption: text,
                    mentions: update.participants
                });
            } else if (update.action == 'remove' && await recupevents(update.id, 'goodbye') == 'on') {
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

    // --- MAIN MESSAGE HANDLER (MERGED FOR EFFICIENCY) ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || !m.key.remoteJid) return;
        
        try {
            // ----- Auto Save Contacts Logic -----
            if (conf.AUTO_SAVE_CONTACTS === 'yes') {
                const from = m.key.remoteJid;
                if (from.endsWith('@s.whatsapp.net') && (!store.contacts[from] || !store.contacts[from].name)) {
                    const number = from.split('@')[0];
                    const vCard = 'BEGIN:VCARD\nVERSION:3.0\nFN:Saved by Qadeer-AI ' + number + '\nTEL;type=CELL;type=VOICE;waid=' + number + ':+'+ number + '\nEND:VCARD\n';
                    await sock.sendMessage(conf.NUMERO_OWNER + '@s.whatsapp.net', {
                        contacts: {
                            displayName: "Saved by Qadeer-AI " + number,
                            contacts: [{ vcard: vCard }]
                        }
                    });
                     await sock.sendMessage(from, { text: `Ssup! Your contact has been saved in my owner's phone.\n\n- QADEER-AI` });
                }
            }
            
            // ----- Auto Reaction, Reply, and Audio Logic -----
            const messageText = m.message.conversation || m.message.extendedTextMessage?.text || "";

            // --- Auto Reaction Logic ---
            if (!m.key.fromMe && (conf.AUTO_REACT === 'yes' || (conf.AUTO_REACT_STATUS === 'yes' && m.key.remoteJid === 'status@broadcast'))) {
                 const now = Date.now();
                 if (now - lastReactionTime > 3000) { // 3 second delay
                    const reactionKeywords = {'hello':['👋'],'thanks':['🙏'],'love':['❤️'],'bye':['👋'],'bot':['🤖']};
                    const randomEmojis = ['😎', '🔥', '💥', '💯', '✨', '🌟', '🌈', '⚡', '💎', '👑'];
                    const words = messageText.split(/\s+/);
                    let reaction = null;
                    for (const word of words) {
                        const emojiList = reactionKeywords[word.toLocaleLowerCase()];
                        if (emojiList) {
                            reaction = emojiList[Math.floor(Math.random() * emojiList.length)];
                            break;
                        }
                    }
                    if (!reaction) {
                        reaction = randomEmojis[Math.floor(Math.random() * randomEmojis.length)];
                    }
                    
                    await sock.sendMessage(m.key.remoteJid, { react: { text: reaction, key: m.key } });
                    lastReactionTime = now;
                 }
            }
            
            // --- Auto Reply & Set Auto Reply Logic ---
            if (messageText && messageText.match(/^[^\w\s]/) && m.key.fromMe) {
                const prefix = messageText[0];
                const command = messageText.substring(1).split(' ')[0];
                const args = messageText.slice(prefix.length + command.length).trim();
                if (command === 'setautoreply' && args) {
                    autoReplyMessage = args;
                    await sock.sendMessage(m.key.remoteJid, { text: `Auto-reply message has been updated to:\n"${autoReplyMessage}"` });
                }
            } else if (conf.AUTO_REPLY === 'yes' && !repliedUsers.has(m.key.remoteJid) && !m.key.fromMe && !m.key.remoteJid.endsWith('@g.us')) {
                await sock.sendMessage(m.key.remoteJid, { text: autoReplyMessage });
                repliedUsers.add(m.key.remoteJid);
            }

            // --- Audio Reply Logic ---
            if (conf.AUDIO_REPLY === 'yes' && !m.key.fromMe) {
                const audioKeywords = {'heya':'hey.wav','hi':'hello.wav','hey':'hey.wav','morning':'goodmorning.wav','night':'goodnight.wav','bot':'pk.mp3','qadeer':'pk.mp3'};
                const words = messageText.split(/\s+/);
                for (const word of words) {
                    const audioFile = audioKeywords[word.toLocaleLowerCase()];
                    if (audioFile) {
                        const audioPath = path.join(__dirname, 'audios', audioFile);
                        if (fs.existsSync(audioPath)) {
                            await sock.sendMessage(m.key.remoteJid, { audio: { url: audioPath }, mimetype: 'audio/mp4', ptt: true });
                        }
                        break; 
                    }
                }
            }
        
            // ----- Main Command Handler Logic -----
            const Jid = jid => {
                if (!jid) return jid;
                if (/:\d+@/gi.test(jid)) {
                    let decode = (0, baileys_1.jidDecode)(jid) || {};
                    return decode.user && decode.server && decode.user + '@' + decode.server || jid;
                } else return jid;
            };

            var mtype = (0, baileys_1.getContentType)(m.message);
            var body = (mtype === 'conversation') ? m.message.conversation : (mtype == 'imageMessage') ? m.message.imageMessage.caption : (mtype == 'videoMessage') ? m.message.videoMessage.caption : (mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : '';

            if (!body) return; // If body is empty, no need to process commands

            var from = m.key.remoteJid;
            var botJid = Jid(sock.user.id);
            var botNumber = botJid.split('@')[0];
            const isGroup = from.endsWith('@g.us');
            var sender = isGroup ? (m.key.participant || m.participant) : m.key.remoteJid;
            if (m.key.fromMe) { sender = botJid; }

            const isCmd = body.startsWith(prefixe);
            if (!isCmd) return; // If it's not a command, stop further processing

            const command = body.substring(1).trim().split(/ +/).shift().toLocaleLowerCase();
            const args = body.trim().split(/ +/).slice(1);
            const cmd = evt.cm.find(c => c.nomCom === command);

            if (cmd) {
                var groupMetadata = isGroup ? await sock.groupMetadata(from) : '';
                var groupName = isGroup ? groupMetadata.subject : '';
                var groupMembers = isGroup ? groupMetadata.participants : '';
                const groupAdmins = isGroup ? groupMembers.filter(p => p.admin).map(p => p.id) : [];
                var isAdmin = isGroup ? groupAdmins.includes(sender) : false;
                var isBotAdmin = isGroup ? groupAdmins.includes(botJid) : false;

                const { getAllSudoNumbers } = require('./lib/sudo');
                const sudoNumbers = await getAllSudoNumbers();
                
                // IMPROVEMENT: Removed hardcoded number, assuming it's in conf.SUDO
                const allAdmins = [botJid, ...conf.SUDO.split(',').map(n => n.trim() + '@s.whatsapp.net')];
                const isSudo = allAdmins.includes(sender);

                // --- Permission Checks ---
                if (conf.MODE.toLowerCase() != 'public' && !isSudo) return;
                if (!isSudo && !isGroup && conf.PM_PERMIT === 'yes') {
                    return sock.sendMessage(from, { text: "You don't have access to commands here." }, { quoted: m });
                }
                if (isGroup) {
                    if (!isSudo && await isGroupBanned(from)) return;
                    if (!isAdmin && await isGroupOnlyAdmin(from)) return;
                }
                if (!isSudo && await isUserBanned(sender)) {
                    return sock.sendMessage(from, { text: "You are banned from using bot commands." }, { quoted: m });
                }

                // --- Execute Command ---
                cmd.fonction(from, sock, {
                    isSudo,
                    isGroup,
                    sender,
                    isAdmin,
                    groupMetadata,
                    groupName,
                    senderName: m.pushName,
                    botJid,
                    isBotAdmin,
                    prefix: prefixe,
                    args,
                    reply: (text) => sock.sendMessage(from, { text: text }, { quoted: m }),
                    mtype,
                    groupAdmins,
                    quoted: m.message.extendedTextMessage?.contextInfo?.quotedMessage,
                    quotedSender: Jid(m.message?.extendedTextMessage?.contextInfo?.participant),
                    m,
                    mybotpic: () => conf.BOT_IMAGE.split(',')[Math.floor(Math.random() * conf.BOT_IMAGE.split(',').length)]
                });
            }
        } catch (e) {
            console.error('Error in messages.upsert handler:', e);
        }
    });

    // --- Connection Update Handler ---
    sock.ev.on('connection.update', async (update) => {
        const { lastDisconnect, connection } = update;
        if (connection === 'connecting') {
            console.log('ℹ️ Connecting to WhatsApp...');
        } else if (connection === 'open') {
            console.log('✅ Connected to WhatsApp!');
            fs.readdirSync(__dirname + '/plugins').forEach(file => {
                if (path.extname(file).toLowerCase() == '.js') {
                    try {
                        require(__dirname + '/plugins/' + file);
                        console.log(file + ' Installed Successfully ✔️');
                    } catch (e) {
                        console.log(file + ' could not be installed due to: ' + e);
                    }
                }
            });
            console.log('Commands Installation Completed ✅');
        } else if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === baileys_1.DisconnectReason.badSession) {
                console.log('Bad Session File. Please delete the session and scan again.');
                // IMPROVEMENT: Exit process for Heroku to restart and re-authenticate
                process.exit(1);
            } else if (reason === baileys_1.DisconnectReason.connectionClosed || reason === baileys_1.DisconnectReason.connectionLost) {
                console.log('Connection Lost/Closed, trying to reconnect...');
                startQadeerBot();
            } else if (reason === baileys_1.DisconnectReason.connectionReplaced) {
                console.log('Connection Replaced. Another session is already open. Please close it!');
            } else if (reason === baileys_1.DisconnectReason.loggedOut) {
                console.log('You are logged out. Please delete the session and scan again.');
                process.exit(1);
            } else if (reason === baileys_1.DisconnectReason.restartRequired) {
                console.log('Restart required, restarting...');
                startQadeerBot();
            } else {
                console.log('Restarting due to an unknown error: ', reason);
                startQadeerBot();
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    return sock;
}

// Initial Start
setTimeout(() => {
    startQadeerBot();
}, 5000);

// Hot-reloading for development
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log('Updating ' + __filename);
    delete require.cache[file];
    require(file);
});
