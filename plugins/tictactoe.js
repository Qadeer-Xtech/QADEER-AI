// tictactoe.js
const { cmd } = require('../command');

const scores = {};
const activeGames = {};
const activeListeners = {};
const gameMeta = {};

// Helper to create a consistent game key
const getGameKey = (player1, player2) => [player1, player2].sort().join('-');

// Start a new Tic Tac Toe game
cmd({
    pattern: 'tictactoe',
    alias: ['ttt', 'xo'],
    desc: 'Start a Tic Tac Toe game',
    category: 'game',
    filename: __filename
}, async (client, message, m, { from, sender, reply, args, participants, isGroup }) => {
    if (!isGroup) return reply('❌ This command can only be used in groups.');

    const senderJid = sender.endsWith('@lid') ? participants.find(p => p.id === sender)?.jid : sender;
    const senderNumber = senderJid.replace(/[^0-9]/g, '');
    const allParticipantJids = participants.map(p => p.jid);
    const opponentNumberRaw = args.join('').replace(/[^0-9]/g, '');

    if (!opponentNumberRaw) {
        return reply('👥 Provide the opponent\'s *WhatsApp number*. Example: .ttt 923151105391');
    }
    if (opponentNumberRaw.length < 10 || opponentNumberRaw.length > 15) {
        return reply('📱 Invalid number format. Use full WhatsApp number like 923151105391');
    }
    if (opponentNumberRaw === senderNumber) {
        return reply('❌ You can\'t play against yourself.');
    }

    const opponentJid = allParticipantJids.find(jid => jid.includes(opponentNumberRaw));
    if (!opponentJid) {
        return reply('❌ The opponent is not in this group.\n\nPaste their *number* (like 923151105391), not tag.');
    }

    const gameKey = getGameKey(senderNumber, opponentNumberRaw);
    if (activeGames[gameKey]) {
        return reply('⚠️ A game is already ongoing between you two.');
    }

    let board = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];
    let currentPlayerSymbol = '❌';
    let turnCount = 0;

    const printBoard = (currentPlayerNum) => {
        return (
            `🎮 *Tic Tac Toe*\n\n` +
            `${board[0]} | ${board[1]} | ${board[2]}\n` +
            `${board[3]} | ${board[4]} | ${board[5]}\n` +
            `${board[6]} | ${board[7]} | ${board[8]}\n\n` +
            `👤 *Turn:* @${currentPlayerNum} (${currentPlayerSymbol})\n\n`+
            `🗨️ Reply to this message with a number (1–9) to play.`
        ).trim();
    };

    const checkWin = () => {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]  // diagonals
        ];
        return winConditions.some(([a, b, c]) => 
            board[a] === currentPlayerSymbol && board[b] === currentPlayerSymbol && board[c] === currentPlayerSymbol
        );
    };

    const gameMessage = await client.sendMessage(from, {
        text: printBoard(senderNumber),
        mentions: [senderJid, opponentJid]
    }, { quoted: m });

    gameMeta[gameKey] = {
        playerX: senderNumber,
        playerO: opponentNumberRaw,
        jidX: senderJid,
        jidO: opponentJid,
        messageID: gameMessage.key.id
    };
    activeGames[gameKey] = true;
    
    const stopGame = (key) => {
        if (activeListeners[key]) {
            client.ev.off('messages.upsert', activeListeners[key]);
        }
        delete activeListeners[key];
        delete activeGames[key];
        delete gameMeta[key];
    };

    const gameHandler = async (update) => {
        try {
            const msg = update.messages?.[0];
            if (!msg?.message || msg.key.remoteJid !== from) return;

            const repliedText = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
            if (!repliedText.match(/^[1-9]$/)) return;

            const playerJid = msg.key.participant || msg.key.remoteJid;
            const playerFullJid = playerJid.endsWith('@lid') ? participants.find(p => p.id === playerJid)?.jid : playerJid;
            if (!playerFullJid) return;

            const playerNumber = playerFullJid.replace(/[^0-9]/g, '');
            const meta = gameMeta[gameKey];
            if (!meta) return;

            const currentPlayerNumber = currentPlayerSymbol === '❌' ? meta.playerX : meta.playerO;
            if (playerNumber !== currentPlayerNumber) {
                return client.sendMessage(from, { 
                    text: '⚠️ It\'s not your turn.',
                    mentions: [currentPlayerSymbol === '❌' ? meta.jidX : meta.jidO]
                }, { quoted: msg });
            }

            const move = parseInt(repliedText);
            const boardIndex = move - 1;

            if (['❌', '⭕'].includes(board[boardIndex])) {
                return client.sendMessage(from, { text: '❎ That spot is already taken.' }, { quoted: msg });
            }

            board[boardIndex] = currentPlayerSymbol;
            turnCount++;

            if (checkWin()) {
                scores[currentPlayerNumber] = (scores[currentPlayerNumber] || 0) + 1;
                await client.sendMessage(from, {
                    text: `🎉 *${currentPlayerSymbol} wins!* @${currentPlayerNumber}\n\n` +
                          `${printBoard(currentPlayerNumber)}\n\n` +
                          `🏆 *Scores:*\n` +
                          `@${meta.playerX}: ${scores[meta.playerX] || 0}\n` +
                          `@${meta.playerO}: ${scores[meta.playerO] || 0}`,
                    mentions: [meta.jidX, meta.jidO]
                }, { quoted: msg });
                stopGame(gameKey);
                return;
            }

            if (turnCount === 9) {
                await client.sendMessage(from, {
                    text: `🤝 *It's a draw!*\n\n${printBoard(currentPlayerNumber)}`,
                    mentions: [meta.jidX, meta.jidO]
                }, { quoted: msg });
                stopGame(gameKey);
                return;
            }
            
            currentPlayerSymbol = currentPlayerSymbol === '❌' ? '⭕' : '❌';
            const nextPlayerNumber = currentPlayerSymbol === '❌' ? meta.playerX : meta.playerO;
            
            const newGameMessage = await client.sendMessage(from, {
                text: printBoard(nextPlayerNumber),
                mentions: [meta.jidX, meta.jidO]
            }, { quoted: msg });
            
            gameMeta[gameKey].messageID = newGameMessage.key.id;

        } catch (error) {
            console.error('[TicTacToe Handler Error]:', error);
        }
    };
    
    activeListeners[gameKey] = gameHandler;
    client.ev.on('messages.upsert', gameHandler);
});


// Stop an active Tic Tac Toe game
cmd({
    pattern: 'tttstop',
    desc: 'Force stop any active Tic Tac Toe game',
    category: 'game',
    filename: __filename
}, async (client, message, m, { sender, reply, participants }) => {
    const senderJid = sender.endsWith('@lid') ? participants.find(p => p.id === sender)?.jid : sender;
    const senderNumber = senderJid.replace(/[^0-9]/g, '');

    const gameKey = Object.keys(activeGames).find(key => key.includes(senderNumber));
    if (!gameKey) {
        return reply('⚠️ You are not in any active game.');
    }

    if (activeListeners[gameKey]) {
        client.ev.off('messages.upsert', activeListeners[gameKey]);
    }

    delete activeGames[gameKey];
    delete activeListeners[gameKey];
    delete gameMeta[gameKey];

    reply('🛑 Game has been stopped.');
});
