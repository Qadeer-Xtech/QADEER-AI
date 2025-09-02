// File: group-acceptall.js
const { cmd } = require('../command');

// Command to list pending join requests
cmd({
    pattern: 'requestlist',
    desc: 'Shows pending group join requests',
    category: 'group',
    filename: __filename
}, async (bot, msg, text, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        await bot.sendMessage(from, { react: { text: '⏳', key: msg.key } });

        if (!isGroup) {
            await bot.sendMessage(from, { react: { text: '❌', key: msg.key } });
            return reply('❌ This command can only be used in groups.');
        }
        if (!isAdmins) {
            await bot.sendMessage(from, { react: { text: '❌', key: msg.key } });
            return reply('❌ Only group admins can use this command.');
        }
        if (!isBotAdmins) {
            await bot.sendMessage(from, { react: { text: '❌', key: msg.key } });
            return reply('❌ I need to be an admin to view join requests.');
        }

        const requests = await bot.groupRequestParticipantsList(from);

        if (requests.length === 0) {
            await bot.sendMessage(from, { react: { text: 'ℹ️', key: msg.key } });
            return reply('ℹ️ No pending join requests.');
        }

        let responseText = `📋 *Pending Join Requests (${requests.length})*\n\n`;
        requests.forEach((req, index) => {
            responseText += `${index + 1}. @${req.jid.split('@')[0]}\n`;
        });

        await bot.sendMessage(from, { react: { text: '✅', key: msg.key } });
        return reply(responseText, { mentions: requests.map(req => req.jid) });

    } catch (error) {
        console.error('Request list error:', error);
        await bot.sendMessage(from, { react: { text: '❌', key: msg.key } });
        return reply('❌ Failed to fetch join requests.');
    }
});

// Command to accept all pending join requests
cmd({
    pattern: 'acceptall',
    alias: ['approve'],
    desc: 'Accepts all pending group join requests',
    category: 'group',
    filename: __filename,
    use: '.acceptall'
}, async (bot, msg, text, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        await bot.sendMessage(from, { react: { text: '⏳', key: msg.key } });

        if (!isGroup) return reply('❌ This command can only be used in groups.');
        if (!isAdmins) return reply('❌ Only group admins can use this command.');
        if (!isBotAdmins) return reply('❌ I need to be an admin to accept join requests.');
        if (typeof bot.groupRequestParticipantsList !== 'function') {
            return reply('❌ Your Baileys version does not support join request listing. Please update the bot.');
        }

        const requests = await bot.groupRequestParticipantsList(from);

        if (!requests || requests.length === 0) {
            return reply('ℹ️ No pending join requests to approve.');
        }

        const jidsToApprove = requests.map(r => r.jid).filter(jid => typeof jid === 'string' && jid.includes('@'));

        for (const jid of jidsToApprove) {
            try {
                await bot.groupRequestParticipantsUpdate(from, [jid], 'approve');
                await new Promise(resolve => setTimeout(resolve, 500)); 
            } catch (err) {
                console.error(`[❌ ERROR] Failed to approve ${jid}:`, err.message);
            }
        }

        await bot.sendMessage(from, { react: { text: '👍', key: msg.key } });
        return reply(`✅ Approved ${jidsToApprove.length} join request(s):\n\n${jidsToApprove.join('\n')}`);
    } catch (error) {
        console.error('[❌ ERROR] AcceptAll failed:', error);
        return reply(`❌ Failed to accept join requests.\n\nError: \`\`\`${error?.message || error?.stack}\`\`\``);
    }
});

// Command to reject all pending join requests
cmd({
    pattern: 'rejectall',
    alias: ['.rejectall', 'unapprove'],
    desc: 'Rejects all pending group join requests',
    category: 'group',
    filename: __filename,
    use: '.rejectall'
}, async (bot, msg, text, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        await bot.sendMessage(from, { react: { text: '⏳', key: msg.key } });
        if (!isGroup) return reply('❌ This command can only be used in groups.');
        if (!isAdmins) return reply('❌ Only group admins can use this command.');
        if (!isBotAdmins) return reply('❌ I need to be an admin to reject join requests.');
        if (typeof bot.groupRequestParticipantsList !== 'function') {
            return reply('❌ Your Baileys version does not support join request listing. Please update the bot.');
        }
        const requests = await bot.groupRequestParticipantsList(from);
        if (!requests || requests.length === 0) {
            return reply('ℹ️ No pending join requests to reject.');
        }
        const jidsToReject = requests.map(r => r.jid).filter(jid => typeof jid === 'string' && jid.includes('@'));
        for (const jid of jidsToReject) {
            try {
                await bot.groupRequestParticipantsUpdate(from, [jid], 'reject');
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error(`[❌ ERROR] Failed to reject ${jid}:`, err.message);
            }
        }
        await bot.sendMessage(from, { react: { text: '👎', key: msg.key } });
        return reply(`✅ Rejected ${jidsToReject.length} join request(s):\n\n${jidsToReject.join('\n')}`);
    } catch (error) {
        console.error('[❌ ERROR] RejectAll failed:', error);
        return reply(`❌ Failed to reject join requests.\n\nError: \`\`\`${error?.message || error?.stack}\`\`\``);
    }
});
