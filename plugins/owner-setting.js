const { cmd } = require('../command');
const { exec } = require('child_process');
const config = require('../config');
const { sleep } = require('../lib/functions');
const { downloadContentFromMessage } = require('baileys');

// --------------------------------------------------------------------------------
// 1. SHUTDOWN COMMAND
// Shuts down the bot process. Only the bot owner can use this.
// --------------------------------------------------------------------------------
cmd({
    pattern: 'shutdown',
    desc: 'Shutdown the bot.',
    category: 'owner',
    filename: __filename
}, async (client, message, text, { from, isPatron, reply }) => {
    // Check if the user is the owner (isPatron)
    if (!isPatron) {
        return reply('❌ Only the bot owner can shutdown the bot!');
    }

    // React to the command message
    await client.sendMessage(from, {
        react: {
            text: '🛑',
            key: message.key
        }
    });

    // Send a shutdown message
    await reply('🛑 Shutting down the bot...');

    // Wait for 1.5 seconds to ensure the message is sent
    await sleep(1500);

    // Exit the Node.js process
    process.exit(0);
});

// --------------------------------------------------------------------------------
// 2. BROADCAST COMMAND
// Sends a message to all groups the bot is in.
// --------------------------------------------------------------------------------
cmd({
    pattern: 'broadcast',
    desc: 'Broadcast a message to all groups.',
    category: 'owner',
    filename: __filename
}, async (client, message, text, { from, isPatron, args, reply }) => {
    // React to the command message
    await client.sendMessage(message.key.remoteJid, {
        react: {
            text: '📢',
            key: message.key
        }
    });

    // Check if the user is the owner
    if (!isPatron) {
        return reply('❌ Only the bot owners can use this command.');
    }

    // Check if a message to broadcast was provided
    if (args.length === 0) {
        return reply('📢 Please provide a message to broadcast.');
    }

    const broadcastMessageText = args.join(' ');
    const announcement = '📢 *ANNOUNCEMENT!*\n\n' + broadcastMessageText + '\n\n*ᴘᴀᴛʀᴏɴ-ᴍᴅ ʙʀᴏᴀᴅᴄᴀsᴛ*';

    try {
        // Get a list of all groups the bot is a member of
        const groupJids = Object.keys(await client.groupFetchAllParticipating());
        let sentCount = 0;

        // Loop through each group and send the announcement
        for (const jid of groupJids) {
            await client.sendMessage(jid, { text: announcement }, { quoted: message });
            sentCount++;
        }

        // Confirm completion
        reply(`📢 Broadcast complete!\nMessage sent to ${sentCount} group(s).`);

    } catch (error) {
        // Handle any errors during the broadcast
        reply('❌ Broadcast failed: ' + error.message);
    }
});

// --------------------------------------------------------------------------------
// 3. SET PROFILE PICTURE COMMAND (setpp)
// Sets the bot's WhatsApp profile picture.
// --------------------------------------------------------------------------------
cmd({
    pattern: 'setpp',
    desc: 'Set bot profile picture.',
    category: 'owner',
    filename: __filename
}, async (client, message, text, { reply, senderNumber }) => {
    // React to the command message
    await client.sendMessage(message.key.remoteJid, {
        react: {
            text: '🖼️',
            key: message.key
        }
    });
    
    // Determine bot's JID and owner's JID
    const botId = client.user.id.split(':')[0];
    const ownerId = client.user.lid ? client.user.lid.split(':')[0] : null;

    // Check if the command user is the bot owner
    if (senderNumber !== botId && senderNumber !== ownerId) {
        return reply('❌ You are not the owner!');
    }

    // Check if the command is a reply to a message
    const quoted = message.message.extendedTextMessage?.contextInfo;
    const quotedMessage = quoted?.quotedMessage;

    // Ensure the replied message is an image
    if (!quotedMessage || !quotedMessage.imageMessage) {
        return reply('❌ Please reply to an *image*.');
    }

    try {
        // Download the image stream
        const stream = await downloadContentFromMessage(quotedMessage.imageMessage, 'image');
        let imageBuffer = Buffer.from([]);

        // Convert stream to buffer
        for await (const chunk of stream) {
            imageBuffer = Buffer.concat([imageBuffer, chunk]);
        }

        const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
        if (!botJid) {
            return reply('❌ Unable to retrieve bot user ID.');
        }

        // Update the profile picture
        await client.updateProfilePicture(botJid, imageBuffer);
        return reply('🖼️ Profile picture updated successfully!');

    } catch (error) {
        // Handle errors during the update
        return reply('❌ Error updating profile picture: ' + error.message);
    }
});


// --------------------------------------------------------------------------------
// 4. DELETE MESSAGE COMMAND
// Deletes a message by replying to it.
// --------------------------------------------------------------------------------
cmd({
    pattern: 'delete',
    alias: ['del', 'delmsg'],
    desc: 'Delete a message (reply to a message)',
    category: 'owner',
    filename: __filename
}, async (client, message, text, { isPatron }) => {

    // Check if the user is the owner
    if (!isPatron) {
        return message.reply('❌ Only the bot owner can delete messages.');
    }

    try {
        // Check if the command is a reply to another message
        if (!message.quoted) {
            return message.reply('⚠️ Please reply to the message you want to delete.');
        }

        // Construct the key of the message to be deleted
        const keyToDelete = {
            remoteJid: message.quoted.chat,
            id: message.quoted.id,
            fromMe: message.quoted.fromMe || false,
            participant: message.quoted.sender
        };

        // Send the delete request
        try {
             await client.sendMessage(message.chat, { delete: keyToDelete });
        } catch (e) {
            // Fallback method if the first one fails
            await client.sendMessage(message.chat, { text: 'Deleting message...', delete: keyToDelete });
        }

        // React with a success emoji
        await client.sendMessage(message.chat, {
            react: {
                text: '✅',
                key: message.key
            }
        });

    } catch (error) {
        console.warn('Delete Error:', error);
        let errorMessage = '❌ Failed to delete message.';

        // Provide specific error feedback
        if (error.message.includes('MessageNotFound')) {
            errorMessage += '\nMessage not found or already deleted.';
        } else if (error.message.includes('NotAllowed')) {
            errorMessage += '\nI need to be admin to delete others\' messages in groups.';
        } else if (error.message.includes('sender not in group')) {
            errorMessage += '\nCouldn\'t identify message sender in group.';
        } else if (error.message.includes('remoteJid')) {
            errorMessage += '\nInvalid message format.';
        }
        
        // Add additional context for group chats
        if (message.isGroup) {
            errorMessage += '\n\nNote: In groups, I can only:';
            errorMessage += '\n- Delete my own messages anytime';
            errorMessage += '\n- Delete others\' messages if I\'m admin';
        }
        
        return message.reply(errorMessage);
    }
});
