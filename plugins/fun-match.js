// fun-match.js

const { cmd } = require('../command');

// --- Command to randomly select a boy from the group ---
cmd({
    pattern: 'bacha',
    alias: ['larka', 'boy'],
    desc: 'Randomly selects a boy from the group.',
    category: 'fun',
    filename: __filename
}, async (sock, m, message, { isGroup, groupMetadata, reply, sender }) => {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '👦', key: m.key } });
    try {
        if (!isGroup) {
            return reply('❌ This command can only be used in groups!');
        }
        
        const participants = groupMetadata.participants;
        // Filter out the bot itself from the list of participants
        const eligibleParticipants = participants.filter(p => !p.id.includes(sock.user.id.split('@')[0]));

        if (eligibleParticipants.length < 1) {
            return reply('❌ No eligible participants found!');
        }
        
        // Select a random participant
        const randomParticipant = eligibleParticipants[Math.floor(Math.random() * eligibleParticipants.length)];
        
        await sock.sendMessage(m.chat, {
            text: `👦 *Yeh lo tumhara Bacha!*\n\n@${randomParticipant.id.split('@')[0]} is your handsome boy! 😎`,
            mentions: [randomParticipant.id]
        }, { quoted: m });

    } catch (error) {
        console.error('Error in .bacha command:', error);
        reply(`❌ Error: ${error.message}`);
    }
});

// --- Command to randomly select a girl from the group ---
cmd({
    pattern: 'bachi',
    alias: ['kuri', 'girl', 'larki'],
    desc: 'Randomly selects a girl from the group.',
    category: 'fun',
    filename: __filename
}, async (sock, m, message, { isGroup, groupMetadata, reply, sender }) => {
    await sock.sendMessage(m.key.remoteJid, { react: { text: '👧', key: m.key } });
    try {
        if (!isGroup) {
            return reply('❌ This command can only be used in groups!');
        }
        
        const participants = groupMetadata.participants;
        // Filter out the bot itself
        const eligibleParticipants = participants.filter(p => !p.id.includes(sock.user.id.split('@')[0]));

        if (eligibleParticipants.length < 1) {
            return reply('❌ No eligible participants found!');
        }

        // Select a random participant
        const randomParticipant = eligibleParticipants[Math.floor(Math.random() * eligibleParticipants.length)];

        await sock.sendMessage(m.chat, {
            text: `👧 *Yeh lo tumhari Bachi!*\n\n@${randomParticipant.id.split('@')[0]} is your beautiful girl! 💖`,
            mentions: [randomParticipant.id]
        }, { quoted: m });

    } catch (error) {
        console.error('Error in .bachi command:', error);
        reply(`❌ Error: ${error.message}`);
    }
});
