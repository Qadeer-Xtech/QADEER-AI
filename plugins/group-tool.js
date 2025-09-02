// File: group-tool.js
const { cmd } = require('../command');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Command to remove all non-admin members
cmd({
    pattern: 'removemembers',
    alias: ['kickall', 'endgc', 'endgroup'],
    desc: 'Remove all non-admin members from the group.',
    category: 'owner',
    filename: __filename
}, async (bot, msg, text, { from, groupMetadata, isBotAdmins, senderNumber, reply, isGroup }) => {

    await bot.sendMessage(from, { react: { text: '👋', key: msg.key } });

    try {
        if (!isGroup) return reply('This command can only be used in groups.');

        // Owner-only check
        const botOwnerJid = bot.user.id.split(':')[0];
        const botOwnerLid = bot.user.lid ? bot.user.lid.split(':')[0] : null;
        if (senderNumber !== botOwnerJid && senderNumber !== botOwnerLid) {
            return reply('❌ Only group admins can use this command.');
        }

        if (!isBotAdmins) return reply('I need to be an admin to execute this command.');

        const allParticipants = groupMetadata.participants;
        // Filter out the bot and its owner from the removal list
        const targets = allParticipants.filter(p => p.id.split('@')[0] !== botOwnerJid && p.id.split(':')[0] !== botOwnerLid);

        if (targets.length === 0) return reply('There are no members to remove.');

        await reply(`🔄 Starting mass removal: ${targets.length} members`);
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < targets.length; i++) {
            try {
                // Add a random delay to avoid rate limiting
                const delay = Math.floor(Math.random() * 2000) + 2000;
                await sleep(delay);
                await bot.groupParticipantsUpdate(from, [targets[i].id], 'remove');
                successCount++;

                if (successCount % 5 === 0) {
                    await reply(`Progress: ${successCount}/${targets.length} members removed...`);
                }
            } catch (err) {
                console.error(`❌ Failed to remove ${targets[i].id}:`, err);
                failCount++;
                await sleep(3000);
            }
        }
        await reply(`✅ Operation Complete!\n• Successfully removed: ${successCount}\n• Failed: ${failCount}`);
        await sleep(3000);
        await bot.groupLeave(from); // Bot leaves after removing everyone

    } catch (error) {
        console.error('❌ Error during mass removal:', error);
        reply('❌ An error occurred during the operation.');
    }
});

// Command to remove all other admins
cmd({
    pattern: 'removeadmins',
    alias: ['kickadmins', 'kickall3', 'deladmins'],
    desc: 'Remove all admin members from the group, excluding the bot and bot owner.',
    category: 'owner',
    filename: __filename
}, async (bot, msg, text, { from, isGroup, senderNumber, groupMetadata, isBotAdmins, reply }) => {
    
    await bot.sendMessage(from, { react: { text: '🎉', key: msg.key } });

    try {
        if (!isGroup) return reply('This command can only be used in groups.');

        // Owner-only check
        const botOwnerJid = bot.user.id.split(':')[0];
        const botOwnerLid = bot.user.lid ? bot.user.lid.split(':')[0] : null;
        if (senderNumber !== botOwnerJid && senderNumber !== botOwnerLid) {
            return reply('❌ Only group admins can use this command.');
        }

        if (!isBotAdmins) return reply('I need to be an admin to execute this command.');

        const allParticipants = groupMetadata.participants;
        // Filter for members who are admins but are not the bot or its owner
        const targets = allParticipants.filter(p => 
            p.admin &&
            p.id.split('@')[0] !== botOwnerJid &&
            p.id.split(':')[0] !== botOwnerLid
        );

        if (targets.length === 0) {
            return reply('There are no admin members to remove (excluding bot and bot owner).');
        }

        await reply(`🔄 Starting to remove ${targets.length} admin members (excluding the bot and bot owner)...`);
        for (let target of targets) {
            try {
                await bot.groupParticipantsUpdate(from, [target.id], 'demote');
                await sleep(2000);
            } catch (err) {
                console.error(`❌ Error removing admins: ${target.id}:`, err);
            }
        }
        await reply('✅ Successfully removed all admin members (excluding bot and bot owner).');

    } catch (error) {
        console.error('removeadmins error:', error);
        reply('❌ An error occurred while trying to remove admins.');
    }
});
