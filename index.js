const fs = require('fs');
const path = require('path');
const P = require('pino');
const express = require('express');
const qrcode = require('qrcode-terminal');
const util = require('util');
const axios = require('axios');
const FileType = require('file-type');
const { fromBuffer } = require('file-type');
const os = require('os');
const { spawn } = require('child_process');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    generateWAMessageFromContent,
    proto,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');

const config = require('./config');
const { getBuffer, getGroupAdmins, getRandom, isUrl, runtime, sleep, fetchJson } = require('./lib/functions');
const { AntiDelete } = require('./lib/antidelete');
const GroupEvents = require('./lib/groupevents');

const log = console.log;

const prefix = config.PREFIX;
const ownerNumber = ['923151105391'];
const tempDir = path.join(os.tmpdir(), 'cache-temp');

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const clearTempDir = () => {
    fs.readdir(tempDir, (err, files) => {
        if (err) throw err;
        for (const file of files) {
            fs.unlink(path.join(tempDir, file), err => {
                if (err) throw err;
            });
        }
    });
};
setInterval(clearTempDir, 5 * 60 * 1000);

if (!fs.existsSync(__dirname + '/sessions/creds.json')) {
    if (!config.SESSION_ID) {
        return console.log('Please add your session to SESSION_ID env !!');
    }
    const sessionData = config.SESSION_ID.replace('Qadeer~', '');
    fs.writeFileSync(__dirname + '/sessions/creds.json', sessionData, 'utf-8', () => {
         console.log('Session downloaded ✅');
    });
}

const app = express();
const port = process.env.PORT || 8082;

app.get('/', (req, res) => {
    
    const htmlFilePath = path.join(__dirname, 'Qadeer', 'qadeer.html');
    
    
    if (fs.existsSync(htmlFilePath)) {
        res.sendFile(htmlFilePath);
    } else {
        res.status(404).send('Error 404: qadeer.html file not found.');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port http://localhost:${port}`);
});

async function connectToWA() {
    log('Connecting to WhatsApp ⏳️...');
    
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/sessions');
    var { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        browser: Browsers.macOS('Firefox'),
        syncFullHistory: true,
        auth: state,
        version
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                connectToWA();
            }
        } else if (connection === 'open') {
            console.log('🧬 Installing Plugins');
            fs.readdirSync('./plugins/').forEach(plugin => {
                if (path.extname(plugin).toLowerCase() === '.js') {
                    require(`./plugins/${plugin}`);
                }
            });
            console.log('Plugins installed successful ✅');
            console.log('Bot connected to whatsapp ✅');
            
            let startupMessage = `╭─〔 *🤍💪 QADEER-AI BOT📳📳* 〕 \n` +
                                `├─▸ *Ultra Super Fast Powerfull ⚠️* \n` +
                                `│     *Latest Bot with Best Features* \n` +
                                `╰─➤ *WhatsApp Brand Bot By Qadeer Khan* \n\n` +
                                `- *🔮 always choose QADEER-AI🔮💯!*\n\n` +
                                `╭──〔 🔗 *Information* 〕 \n` +
                                `├─ 🧩 *Prefix:* = ${prefix}\n` +
                                `├─ 📢 *Join Channel:* \n`+
                                `│    https://whatsapp.com/channel/0029Vaw6yRaBPzjZPtVtA80A \n`+
                                `├─ 🌟 *MESSAGE DEVELOPER/OWNER+923151105391*\n`+
                                `│    \n`+
                                `╰─🚀 *𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*`;

            sock.sendMessage(sock.user.id, {
                image: { url: 'https://res.cloudinary.com/dtjjgiitl/image/upload/q_auto:good,f_auto,fl_progressive/v1753271440/h4zzcb49vfmaqv5quq4m.jpg' },
                caption: startupMessage
            });
        }
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.update', async (messages) => {
        for (const { update } of messages) {
            if (update.messageStubType === null) {
                log('Delete Detected:', JSON.stringify(update, null, 2));
                await AntiDelete(sock, messages);
            }
        }
    });
    sock.ev.on('group-participants.update', (update) => GroupEvents(sock, update));
    sock.ev.on('messages.upsert', async (upsert) => {
        const m = upsert.messages[0];
        if (!m.message) return;
        m.message = getContentType(m.message) === 'ephemeralMessage' ? m.message.ephemeralMessage.message : m.message;
        if (config.READ_MESSAGE === 'true') {
            await sock.readMessages([m.key]);
            console.log(`Marked message from ${m.key.remoteJid} as read.`);
        }
        if (m.key && m.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN === 'true') {
            await sock.readMessages([m.key]);
        }
        if (m.key && m.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === 'true') {
            const randomEmoji = ['❤️', '💸', '😇', '🍂', '💥', '💯', '🔥', '💫', '💎', '💗', '🤍', '🖤', '👀', '🙌', '🙆', '🚩', '🥰', '💐', '😎', '🤎', '✅', '🫀', '🧡', '😁', '😄', '🌸', '🕊️', '🌷', '⛅', '🌟', '🗿', '🇵🇰', '💜', '💙', '🌝', '🖤', '💚'];
            const reaction = randomEmoji[Math.floor(Math.random() * randomEmoji.length)];
            await sock.sendMessage(m.key.remoteJid, { react: { text: reaction, key: m.key } });
        }
        if (m.key && m.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REPLY === 'true') {
            const replyText = '' + config.AUTO_STATUS_MSG;
            await sock.sendMessage(m.key.participant, { text: replyText, react: { text: '💜', key: m.key } }, { quoted: m });
        }
        require('./command')(sock, m);
    });
}

connectToWA();
