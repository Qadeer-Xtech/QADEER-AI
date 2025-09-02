// File: group-out.js
const { cmd } = require('../command');

cmd({
    pattern: 'out',
    alias: ['ck', '🦶'],
    desc: 'Removes all members with a specific country code from the group',
    category: 'admin',
    filename: __filename
}, async (bot, msg, text, { from, q, isGroup, isBotAdmins, reply, groupMetadata, senderNumber }) => {
    
    await bot.sendMessage(msg.key.remoteJid, { react: { text: '🤔', key: msg.key } });

    if (!isGroup) return reply('❌ This command can only be used in groups.');

    // Owner-only check
    const botId = bot.user.id.split(':')[0];
    const botLid = bot.user.lid ? bot.user.lid.split(':')[0] : null;
    if (senderNumber !== botId && senderNumber !== botLid) {
        return reply('❌ Only group admins can use this command.');
    }

    if (!isBotAdmins) return reply('❌ I need to be an admin to use this command.');
    if (!q) return reply('❌ Please provide a country code. Example: .out 91');

    const countryCode = q.trim();
    if (!/^\d+$/.test(countryCode)) {
        return reply('❌ Invalid country code. Please provide only numbers (e.g., 91 for +91 numbers)');
    }

    try {
        const participants = groupMetadata?.participants;
        if (!participants) return reply("❌ Couldn't fetch group participants.");

        // Filter for members with the specified country code who are not admins
        const targets = participants.filter(p =>
            p.id &&
            p.id.split('@')[0].startsWith(countryCode) &&
            !p.admin
        );

        if (targets.length === 0) {
            return reply(`❌ No non-admin members found with country code +${countryCode}`);
        }

        for (const target of targets) {
            await bot.groupParticipantsUpdate(from, [target.id], 'remove');
            await new Promise(resolve => setTimeout(resolve, 1500)); // Delay between removals
        }

        reply(`✅ Successfully removed ${targets.length} member(s) with country code +${countryCode}`);
    } catch (error) {
        console.error('Out command error:', error);
        reply(`❌ Failed to remove members. Error: ${error.message}`);
    }
});
