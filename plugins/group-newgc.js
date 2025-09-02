// File: group-newgc.js
const { cmd } = require('../command');
const config = require('../config');
const { sleep } = require('../lib/functions2');
const prefix = config.PREFIX;

cmd({
    pattern: 'newgc',
    alias: ['creategc'],
    category: 'group',
    desc: 'Create a new group with only the sender added.',
    filename: __filename
}, async (bot, msg, text, { args, sender, reply, senderNumber, isGroup }) => {
    try {
        if (isGroup) {
            return reply('❌ This command can only be used in private chat with the bot.');
        }

        // Check if the user is the bot owner
        const botId = bot.user.id.split(':')[0];
        const botLid = bot.user.lid ? bot.user.lid.split(':')[0] : null;
        if (senderNumber !== botId && senderNumber !== botLid) {
            return reply('❌ Only the bot owner can use this command.');
        }

        const groupName = args.join(' ').trim();
        if (!groupName) {
            return reply(`⚠️ *Usage:* ${prefix}newgc <group_name>\n\n❌ *Error:* Group name cannot be empty.`);
        }
        if (groupName.length > 25) {
            return reply('❌ Group name too long. Use less than 25 characters.');
        }

        // Create the group with the sender as the only participant
        const senderJid = sender.endsWith('@s.whatsapp.net') ? sender : sender + '@s.whatsapp.net';
        const newGroup = await bot.groupCreate(groupName, [senderJid]);

        await sleep(3000); // Wait for the group creation to fully process

        const inviteCode = await bot.groupInviteCode(newGroup.id).catch(err => {
            console.error('Error getting invite code:', err);
            return null;
        });

        let response = `✅ *Group created successfully!*\n\n🆔 *Group Name:* ${groupName}\n👤 *Added:* @${senderNumber}`;
        if (inviteCode) {
            response += `\n🔗 *Invite Link:* https://chat.whatsapp.com/${inviteCode}\n`;
        }
        reply(response);

    } catch (error) {
        console.error('Error in newgc:', error);
        let errorMessage = '❌ Failed to create group. Please try again.';
        if (error.message?.includes('Connection Closed') || error.message?.includes('Timed Out')) {
            errorMessage = '❌ Connection error. Please try again after a few seconds.';
        }
        reply(errorMessage);
    }
});
