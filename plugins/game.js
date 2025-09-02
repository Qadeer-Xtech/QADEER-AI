// game.js
const { cmd } = require('../command');

// Global state to hold game information for each chat
const gameState = globalThis.squidGameState || (globalThis.squidGameState = {});

cmd({
    pattern: 'squidgame',
    desc: '🦑 How to Play: Squid Game (WhatsApp Bot Edition)\n\n🔰 How to Start\n1. Type `.squidgame` to start the game in a group.\n2. Other players must join by sending `squidgame join`.\n3. You have 1 minute to join the game.\n4. The bot will notify at 30s and 10s left.\n5. Game auto-starts if at least 2 players joined.\n\n🟢 Green Light Phase (10 seconds)\n- Spam messages quickly.\n- Each message = +1 point.\n- First to 50 messages wins.\n\n🔴 Red Light Phase (5 seconds)\n- DO NOT type.\n- If you type, you\'re eliminated instantly.\n\n🏆 How to Win\n- Reach 50 messages during green light.\n- Don’t get eliminated during red light.\n\n📊 Live Leaderboard\n- Random leaderboard shown during red light.\n- Shows top players and progress.\n\n❌ Elimination\n- Send message during red light = instant elimination.\n- You’ll be tagged if eliminated.\n\n💬 Commands Summary\n- Start Game: `.squidgame`\n- Join Game: `squidgame join`\n\n🔥 Good luck! Only one will survive!',
    category: 'fun',
    filename: __filename
}, async (sock, message, { args, reply }) => {

    const chatId = message.chat;
    const senderId = message.sender;
    const isJoinCmd = args[0]?.toLowerCase() === 'join';

    if (isJoinCmd) {
        // Handle joining the game
        if (!gameState[chatId] || gameState[chatId].status !== 'waiting') {
            return reply('❌ No Squid Game lobby open. Type `.squidgame` to start one.');
        }
        if (gameState[chatId].players.find(player => player.id === senderId)) {
            return reply('❗ You’ve already joined the game.');
        }
        gameState[chatId].players.push({ id: senderId });
        await sock.sendMessage(chatId, {
            text: `✅ @${senderId.split('@')[0]} has joined the Squid Game!\n Use .help squidgame if you dont understand`,
            mentions: [senderId]
        });
        return;
    }

    // Handle starting a new game
    if (gameState[chatId]) {
        return reply('⚠️ A Squid Game is already in progress.');
    }

    gameState[chatId] = {
        status: 'waiting',
        players: [{ id: senderId }],
        scores: {},
        eliminated: [],
        interval: null,
        currentLight: null
    };

    await sock.sendMessage(chatId, {
        text: `✅ @${senderId.split('@')[0]} has started a Squid Game lobby!`,
        mentions: [senderId]
    });
    
    await sock.sendMessage(chatId, {
        text: '🔴 *Squid Game: Red Light, Green Light!*\n\nType ".squidgame join" to participate.\n⏳ You have 1 minute to join.\nUse .help squidgame if you dont understand'
    });

    setTimeout(() => sock.sendMessage(chatId, { text: '🕒 30 seconds left to join!' }), 30000);
    setTimeout(() => sock.sendMessage(chatId, { text: '⏰ 10 seconds left to join!' }), 50000);

    // Start the game after 60 seconds
    setTimeout(async () => {
        const game = gameState[chatId];
        if (!game.players || game.players.length < 2) {
            delete gameState[chatId];
            return sock.sendMessage(chatId, { text: '❌ Not enough players joined. At least 2 players required.' });
        }

        game.status = 'started';
        game.players.forEach(player => game.scores[player.id] = 0);

        await sock.sendMessage(chatId, {
            text: `🎮 Game Starting with ${game.players.length} players!\n\nGoal: First to send 50 messages during 🟩 *Green Light* wins.\n🟥 *Red Light* = silence or elimination!`
        });

        startGameLoop(sock, chatId);
    }, 60000);
});

function startGameLoop(sock, chatId) {
    const game = gameState[chatId];
    if (!game) return;

    const gameInterval = setInterval(async () => {
        // Check for winner or if only one player is left
        if (game.players.length <= 1) {
            clearInterval(game.interval);
            game.status = 'ended';
            const winner = game.players[0];
            await sock.sendMessage(chatId, {
                text: `🏆 *Congratulations @${winner.id.split('@')[0]}!*\nYou survived and won the Squid Game with ${game.scores[winner.id]} messages!`,
                mentions: [winner.id]
            });
            delete gameState[chatId];
            return;
        }

        // Green Light Phase
        game.currentLight = 'green';
        await sock.sendMessage(chatId, { text: '🟩 *GREEN LIGHT!* Start sending messages!' });
        await delay(10000);

        // This function would be called by the message listener to eliminate players
        if (typeof global.eliminateSilentPlayers === 'function') {
            await global.eliminateSilentPlayers(sock, chatId);
        }

        // Red Light Phase
        game.currentLight = 'red';
        await sock.sendMessage(chatId, { text: '🟥 *RED LIGHT!* Stay silent or be eliminated!' });

        // Randomly show leaderboard during red light
        if (Math.random() > 0.4) {
            const leaderboard = Object.entries(game.scores)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([id, score], index) => `${index + 1}. @${id.split('@')[0]} - ${score} msgs`)
                .join('\n');
            await sock.sendMessage(chatId, {
                text: `📊 *Live Leaderboard:*\n\n${leaderboard}`,
                mentions: Object.keys(game.scores)
            });
        }
        
        await delay(5000);
    }, 15000);

    game.interval = gameInterval;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
