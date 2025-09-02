// Import necessary functions from other modules
const { getLinkDetectionMode } = require('../linkDetection');
const { getWarnings, addWarning, resetWarnings } = require('../warnings');

/**
 * Sets up the anti-link detection feature for the WhatsApp bot.
 * This function listens for new messages and takes action if a link is detected.
 * @param {object} sock - The Baileys socket instance.
 */
const setupLinkDetection = (sock) => {
    // Listen for the 'messages.upsert' event, which fires on new messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        // Process each message in the event
        for (const message of messages) {
            const groupId = message.key.remoteJid;

            // Ignore messages that are not in a group or are from the bot itself
            if (!groupId.endsWith('@g.us') || message.key.fromMe) {
                continue;
            }

            try {
                // Get the current anti-link mode for this group
                const { mode } = getLinkDetectionMode(groupId);

                // If anti-link is turned off for this group, do nothing
                if (!mode) {
                    continue;
                }

                // Extract the text content from the message
                const messageText = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

                // Regular expression to detect various types of links
                const linkRegex = /(?:https?:\/\/)?(?:www\.)?(?:[\w-]+\.)+[a-z]{2,}(?:\/[^\s]*)?|(?:https?:\/\/)?(?:chat\.whatsapp\.com|discord\.gg|t\.me|bit\.ly|wa\.me)\/[^\s]+/gi;

                // If no link is found in the message, do nothing
                if (!linkRegex.test(messageText)) {
                    continue;
                }

                console.log(`🔗 Detected link in group ${groupId}: ${messageText}`);

                // Identify the sender of the message
                const senderId = message.key.participant || message.participant || message.key.remoteJid;
                const senderName = message.pushName || 'user';

                // Get group metadata to check admin status
                const groupMetadata = await sock.groupMetadata(groupId);
                const groupName = groupMetadata.subject || 'this group';
                const isSenderAdmin = groupMetadata.participants.some(p => p.id === senderId && p.admin);

                // If the sender is an admin, ignore the link
                if (isSenderAdmin) {
                    console.log(`✅ Ignoring admin: ${senderId}`);
                    continue;
                }

                // --- ACTION: Delete the message containing the link ---
                await sock.sendMessage(groupId, { delete: message.key });

                // --- Take further action based on the configured mode ---

                // Mode: 'warn' - Warn the user, and kick after 3 warnings
                if (mode === 'warn') {
                    const warningCount = addWarning(groupId, senderId);
                    await sock.sendMessage(groupId, {
                        text: `🚫 *${senderName}*, sending links in *${groupName}* is not allowed.\n⚠️ Warning: ${warningCount}/3`,
                        mentions: [senderId]
                    });

                    // If warnings reach the limit (3), kick the user
                    if (warningCount >= 3) {
                        await sock.groupParticipantsUpdate(groupId, [senderId], 'remove');
                        await sock.sendMessage(groupId, {
                            text: `@${senderId.split('@')[0]} (*${senderName}*) has been removed from *${groupName}* for ignoring multiple link warnings. 🚷`,
                            mentions: [senderId]
                        });
                        // Reset warnings for the user after they are kicked
                        resetWarnings(groupId, senderId);
                    }
                } 
                // Mode: 'kick' - Instantly kick the user for sending a link
                else if (mode === 'kick') {
                    await sock.groupParticipantsUpdate(groupId, [senderId], 'remove');
                    await sock.sendMessage(groupId, {
                        text: `@${senderId.split('@')[0]} (*${senderName}*) has been removed instantly for posting a link. ❌\n\nLinks are *strictly prohibited* in *${groupName}*!`,
                        mentions: [senderId]
                    });
                } 
                // Mode: 'delete' - Only delete the message and send a notification
                else if (mode === 'delete') {
                    await sock.sendMessage(groupId, {
                        text: `🔍 *${senderName}*, your link was removed.\n🚫 Please avoid posting links in *${groupName}*.`,
                        mentions: [senderId]
                    });
                }

            } catch (error) {
                console.error('Error in link detection:', error);
            }
        }
    });
};

// Export the setup function to be used in the main bot file
module.exports = {
    setupLinkDetection
};
