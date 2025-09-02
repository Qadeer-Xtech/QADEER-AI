const { cmd } = require('../command');
const { enableLinkDetection, disableLinkDetection, getLinkDetectionMode } = require('../lib/linkDetection');
const { handleLinkDetection } = require('../lib/linkDetectionHandler');
const { getWarnings, addWarning, resetWarnings } = require('../lib/warnings');
const config = require('../config');

// Command to configure the anti-link system
cmd({
    pattern: 'antilink',
    desc: 'Manage anti-link settings in a group.',
    category: 'group',
    filename: __filename,
    use: '[kick/delete/warn/off]'
}, async (sock, m, store, { from, args, isGroup, reply, isAdmins, isBotAdmins }) => {
    
    await sock.sendMessage(store.key.remoteJid, { react: { text: '🔒', key: store.key } });

    if (!isGroup) {
        return reply('*{ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ}*\nᴛʜɪs ғᴇᴀᴛᴜʀᴇ ᴄᴀɴ ᴏɴʟʏ ʙᴇ ᴜsᴇᴅ ɪɴ ɢʀᴏᴜᴘ!!');
    }
    if (!isAdmins) {
        return reply('*{ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ}*\nᴛʜɪs ғᴇᴀᴛᴜʀᴇ ɪs ғᴏʀ bot owner ᴏɴʟʏ!!');
    }
    if (!isBotAdmins) {
        return reply('❌ I need to be an admin to perform this action.');
    }

    const mode = args.length > 0 ? args[0].toLowerCase() : null;

    if (!mode || !['kick', 'delete', 'warn', 'off'].includes(mode)) {
        return reply('*Usage: antilink [kick/delete/warn/off]*');
    }

    try {
        if (mode === 'off') {
            const { message } = disableLinkDetection(from);
            return reply('*' + message + '*');
        }
        const { message } = enableLinkDetection(from, mode);
        return reply('*' + message + '*');
    } catch (error) {
        return reply('*Error: ' + error.message + '*');
    }
});

// Command to warn a user
cmd({
    pattern: 'warn',
    desc: 'Warn a specific user. After 3 warnings, the user will be kicked.',
    category: 'group',
    filename: __filename,
    use: '<reply to user>'
}, async (sock, m, store, { from, isGroup, isTofan, isAdmins, isBotAdmins, reply }) => {

    await sock.sendMessage(store.key.remoteJid, { react: { text: '🔒', key: store.key } });

    if (!isGroup) {
        return reply('❌ *Access Denied!*\n> This command can only be used in groups.');
    }
    if (!isAdmins && !isTofan) {
        return reply('❌ *Access Denied!*\n> Only *owners* can issue warnings.');
    }
    if (!isBotAdmins) {
        return reply('❌ I need to be an admin to use this command.');
    }
    if (!store.quoted) {
        return reply('⚠️ *Please reply to a user\'s message to warn them.*');
    }

    const userToWarn = store.quoted.sender;
    if (!userToWarn) {
        return reply('❌ *Unable to identify the user to warn.*');
    }
    if (userToWarn.split('@')[0] === '923151105391') { // Bot owner number check
        return reply('🚫 *Action Blocked!*\n> You cannot warn the bot creator.');
    }

    try {
        // Attempt to delete the quoted message
        if (store.quoted.key) {
            await sock.sendMessage(from, { delete: store.quoted.key });
        }
    } catch (e) {
        console.error('Error deleting message:', e);
        await reply('⚠️ *Failed to delete the message.*\n> ' + e.message);
    }

    const userName = '@' + userToWarn.split('@')[0];
    const warningCount = addWarning(from, userToWarn);

    if (warningCount >= 3 && isBotAdmins) {
        try {
            await sock.groupParticipantsUpdate(from, [userToWarn], 'remove');
            resetWarnings(from, userToWarn);
            return reply('⚠️ *' + userName + ' has received 3 warnings and has been removed from the group.*');
        } catch (e) {
            return reply('❌ *Failed to remove ' + userName + '.*\n> ' + e.message);
        }
    } else if (warningCount >= 3) {
        return reply('⚠️ *' + userName + ' has received 3 warnings but I\'m not an admin to remove them.*');
    }

    return reply('⚠️ *' + userName + ' has been warned.*\n> Total warnings: *' + warningCount + '/3*');
});

// Command to reset warnings for a user
cmd({
    pattern: 'resetwarn',
    desc: 'Reset warnings for a specific user.',
    category: 'group',
    filename: __filename,
    use: '<reply to user>'
}, async (sock, m, store, { from, isGroup, isTofan, isAdmins, isBotAdmins, reply }) => {

    await sock.sendMessage(store.key.remoteJid, { react: { text: '🔒', key: store.key } });

    if (!isGroup) {
        return reply('❌ *Access Denied!*\n> This command can only be used in groups.');
    }
    if (!isAdmins && !isTofan) {
        return reply('❌ *Access Denied!*\n> Only *owners* can reset warnings.');
    }
    if (!isBotAdmins) {
        return reply('❌ I need to be an admin to use this command.');
    }
    if (!store.quoted) {
        return reply('⚠️ *Please reply to the user whose warnings you want to reset.*');
    }

    const userToReset = store.quoted.sender;
    if (!userToReset) {
        return reply('❌ *Unable to identify the user to reset.*');
    }
    if (userToReset.split('@')[0] === '923151105391') { // Bot owner number check
        return reply('🚫 *Action Blocked!*\n> You cannot reset warnings for the bot creator.');
    }

    const userName = '@' + userToReset.split('@')[0];
    resetWarnings(from, userToReset);
    return reply('✅ *Warnings reset for ' + userName + '.*');
});
