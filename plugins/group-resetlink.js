// File: group-resetlink.js
const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
    pattern: 'revokegrouplink',
    alias: ['resetlink', 'revokelink', 'f_revoke'],
    desc: 'To Reset the group link',
    category: 'group',
    filename: __filename
}, async (bot, msg, text, { from, isGroup, isAdmins, isBotAdmins, isDev, reply }) => {
    
    await bot.sendMessage(from, { react: { text: '🖇️', key: msg.key } });

    try {
        // Fetching remote messages for replies, can be simplified
        const replyMessages = (await fetchJson('https://raw.githubusercontent.com/Qadeer-Xtech/TOFAN-DATA/refs/heads/main/MSG/mreply.json')).replyMsg;

        if (!isGroup) return reply(replyMessages.only_gp);
        if (!isAdmins && !isDev) return reply(replyMessages.you_adm, { quoted: msg });
        if (!isBotAdmins) return reply(replyMessages.give_adm);

        await bot.groupRevokeInvite(from);
        await bot.sendMessage(from, { text: '*Group link Reseted* ⛔' }, { quoted: msg });

    } catch (error) {
        await bot.sendMessage(from, { react: { text: '❌', key: msg.key } });
        console.log(error);
        reply('❌ *An Error Occurred !!*\n\n' + error);
    }
});
