// wrg.js

const axios = require('axios');
const { cmd } = require('../command');

// In-memory storage for game instances
const wrgGames = {};
const turnTimers = {};
const wrgStartTimers = {};

/**
 * Checks if a message is a reply related to the Word Relay Game.
 * @param {object} message - The message object.
 * @returns {boolean} - True if it's a game-related message.
 */
function isGameReplyMessage(message) {
    const textContent = message.conversation || message.extendedTextMessage?.text || message.message?.text || message.message?.conversation || '';
    return textContent.includes('#wrg');
}

/**
 * Gets the phone number (without @s.whatsapp.net) of a participant.
 * @param {string} jid - The participant's JID.
 * @param {Array<object>} participants - The list of group participants.
 * @returns {string} - The phone number.
 */
function getPhoneNumber(jid, participants) {
    const participant = participants?.find(p => p.id === jid || p.phoneNumber === jid);
    return participant?.id?.split('@')[0] || jid.split('@')[0];
}

// --- Main .wrg command handler ---
cmd({
    pattern: 'wrg',
    desc: 'Word Relay Game: .wrg, .wrg stop, .wrg leave',
    category: 'game',
    filename: __filename
}, async (sock, m, message, { from, sender, isGroup, args, participants }) => {
    const command = (args[0] || '').toLowerCase();

    if (!command) {
        if (!isGroup) {
            return await sock.sendMessage(from, { text: '❗ This game only works in *groups*.\n#wrg' });
        }
        if (wrgGames[from]) {
            return await sock.sendMessage(from, { text: '⚠️ A game is *already running* in this group.\n#wrg' });
        }

        // --- Create a new game ---
        wrgGames[from] = {
            players: [sender],
            started: false,
            round: 1,
            minLen: 3,
            currentLetter: '',
            turn: 0,
            usedWords: [],
            turnTime: 40 // seconds
        };

        const initialMessage = `🎮 *Word Relay Game Created!*\n\n👤 Player 1: @${getPhoneNumber(sender, participants)}\n\nType *join* to join the game!\n\nGame will start in 40s if at least 2 people join.\n*Please make your bot public before the game starts*\n#wrg`;
        await sock.sendMessage(from, { text: initialMessage, mentions: [sender] });

        // --- Timers for game start ---
        setTimeout(() => {
            if (wrgGames[from] && !wrgGames[from].started) {
                sock.sendMessage(from, { text: '⏳ 30 seconds remaining to join the game!\nType *join* to join.\n#wrg' });
            }
        }, 10000);

        setTimeout(() => {
            if (wrgGames[from] && !wrgGames[from].started) {
                sock.sendMessage(from, { text: '⏳ 10 seconds left! Type *join* to join the Word Relay Game.\n#wrg' });
            }
        }, 30000);

        // --- Start the game after 40 seconds ---
        wrgStartTimers[from] = setTimeout(() => {
            const game = wrgGames[from];
            if (!game || game.started) return;

            if (game.players.length >= 2) {
                game.started = true;
                game.currentLetter = randomLetter();
                game.turn = 0;

                const firstPlayer = game.players[0];
                const secondPlayer = game.players[1];
                const startMessage = `🎮 *Game starting!*\n\n🔤 First Letter: *${game.currentLetter.toUpperCase()}*\nMin letters: *3*\n\n🎯 @${getPhoneNumber(firstPlayer, participants)}, it's your turn!\nStart with: *${game.currentLetter.toUpperCase()}*\n\nNext: @${getPhoneNumber(secondPlayer, participants)}\n⏱️ ${game.turnTime}s\n#wrg`;
                
                sock.sendMessage(from, { text: startMessage, mentions: [firstPlayer, secondPlayer] });
                startTurnTimeout(from, sock, participants);
            } else {
                sock.sendMessage(from, { text: '🚫 Not enough players joined. Game cancelled.\n#wrg' });
                delete wrgGames[from];
            }
        }, 40000);
        return;
    }

    // --- .wrg stop command ---
    if (command === 'stop') {
        if (!wrgGames[from]) {
            return await sock.sendMessage(from, { text: '❌ No game running.\n#wrg' });
        }
        delete wrgGames[from];
        return await sock.sendMessage(from, { text: '🛑 Game has been stopped.\n#wrg' });
    }

    // --- .wrg leave command ---
    if (command === 'leave') {
        const game = wrgGames[from];
        if (!game) {
            return await sock.sendMessage(from, { text: '❌ No game running.\n#wrg' });
        }
        if (!game.players.includes(sender)) {
            return await sock.sendMessage(from, { text: '😕 You are not in the game.\n#wrg' });
        }

        game.players = game.players.filter(p => p !== sender);
        await sock.sendMessage(from, { text: `👋 @${getPhoneNumber(sender, participants)} left the game.\n#wrg`, mentions: [sender] });

        if (game.players.length < 2 && game.started) {
            await sock.sendMessage(from, { text: '🏁 Not enough players left. Game ended.\n#wrg' });
            delete wrgGames[from];
        }
        return;
    }
});

// --- Listener for game messages (join and word submissions) ---
cmd({
    on: 'message'
}, async (sock, m, message, { from, sender, body, participants }) => {
    const game = wrgGames[from];

    // --- Handle "join" keyword ---
    if (body?.toLowerCase?.() === 'join') {
        if (!game || game.started) return;
        if (game.players.includes(sender)) {
            return sock.sendMessage(from, { text: '😅 You already joined!\n#wrg' });
        }
        game.players.push(sender);
        return await sock.sendMessage(from, { text: `✅ @${getPhoneNumber(sender, participants)} joined the game!\n#wrg`, mentions: [sender] });
    }

    // --- Handle word submissions ---
    if (!game || !game.started || !game.players.includes(sender) || game.players[game.turn] !== sender || isGameReplyMessage(message)) {
        return;
    }

    const word = body.toLowerCase().trim();

    const sendError = async (errorMessage) => {
        await sock.sendMessage(from, { text: `⚠️ @${getPhoneNumber(sender, participants)}, ${errorMessage}\nTry again before your time runs out!\n#wrg`, mentions: [sender] });
    };

    if (word.length < game.minLen) {
        return sendError(`your word is too short. Minimum length: ${game.minLen}`);
    }
    if (game.currentLetter && word[0] !== game.currentLetter) {
        return sendError(`your word must start with *${game.currentLetter.toUpperCase()}*`);
    }

    try {
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        if (!Array.isArray(response.data)) throw new Error();

        clearTimeout(turnTimers[from]);
        game.usedWords.push(word);
        game.round++;

        // Increase difficulty
        if ((game.round - 1) % game.players.length === 0) {
            game.minLen++;
            if (game.turnTime > 10) {
                game.turnTime = Math.max(game.turnTime - 5, 10);
            }
        }

        game.turn = (game.turn + 1) % game.players.length;
        game.currentLetter = word[word.length - 1];

        const nextPlayer = game.players[game.turn];
        const nextNextPlayer = game.players[(game.turn + 1) % game.players.length];

        const successMessage = `✅ Great job @${getPhoneNumber(sender, participants)}!\nWord: *${word}*\n\n🎯 @${getPhoneNumber(nextPlayer, participants)}, you're next!\nStart with: *${game.currentLetter.toUpperCase()}*\nMin length: ${game.minLen}\n⏱️ You have ${game.turnTime}s\n#wrg`;
        await sock.sendMessage(from, { text: successMessage, mentions: [sender, nextPlayer, nextNextPlayer] });
        startTurnTimeout(from, sock, participants);

    } catch (error) {
        return sendError('that word is invalid or not found in the dictionary.');
    }
});

/**
 * Starts the timer for the current player's turn.
 * @param {string} from - The group JID.
 * @param {object} sock - The Baileys socket instance.
 * @param {Array<object>} participants - The list of group participants.
 */
function startTurnTimeout(from, sock, participants) {
    const game = wrgGames[from];
    const currentPlayer = game.players[game.turn];
    if (turnTimers[from]) clearTimeout(turnTimers[from]);

    turnTimers[from] = setTimeout(async () => {
        await sock.sendMessage(from, { text: `⏰ @${getPhoneNumber(currentPlayer, participants)} was too slow and is disqualified!\n#wrg`, mentions: [currentPlayer] });
        
        game.players = game.players.filter(p => p !== currentPlayer);

        if (game.players.length === 1) {
            const winner = game.players[0];
            await sock.sendMessage(from, { text: `🏆 Congratulations @${getPhoneNumber(winner, participants)}! You are the *winner* of this Word Relay Game! 🎉\n#wrg`, mentions: [winner] });
            delete wrgGames[from];
            return;
        }

        if (game.players.length < 2) {
            sock.sendMessage(from, { text: '🏁 Not enough players left. Game ended.\n#wrg' });
            delete wrgGames[from];
            return;
        }

        game.turn %= game.players.length;
        setTimeout(() => nextTurn(sock, from, participants), 1000);
    }, game.turnTime * 1000);
}

/**
 * Advances the game to the next turn.
 * @param {object} sock - The Baileys socket instance.
 * @param {string} from - The group JID.
 * @param {Array<object>} participants - The list of group participants.
 */
function nextTurn(sock, from, participants) {
    const game = wrgGames[from];
    if (!game) return;

    const currentPlayer = game.players[game.turn];
    const nextPlayer = game.players[(game.turn + 1) % game.players.length];

    const turnMessage = `🎯 @${getPhoneNumber(currentPlayer, participants)}, it's your turn!\nStart with: *${game.currentLetter.toUpperCase()}*\nMin letters: ${game.minLen}\nNext: @${getPhoneNumber(nextPlayer, participants)}\n⏱️ ${game.turnTime}s\n#wrg`;
    sock.sendMessage(from, { text: turnMessage, mentions: [currentPlayer, nextPlayer] });
    startTurnTimeout(from, sock, participants);
}

/**
 * Returns a random letter from the alphabet.
 * @returns {string} - A random letter.
 */
function randomLetter() {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    return alphabet[Math.floor(Math.random() * alphabet.length)];
}
