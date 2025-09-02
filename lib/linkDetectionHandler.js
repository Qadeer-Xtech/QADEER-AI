// linkDetectionHandler.js

const {
    getLinkDetectionMode
} = require('./linkDetection');
const {
    incrementWarning,
    resetWarning,
    getWarningCount
} = require('./warnings');
const {
    getPDMStatus,
    updatePDMStatus
} = require('../plugins/pdmCommands');
const fs = require('fs');

const setupLinkDetection = (sock) => {

    // --- Handler for Link Detection in New Messages ---
    sock.ev.on('messages.upsert', async ({
        messages
    }) => {
        for (const message of messages) {
            if (!message.message) continue;

            const groupId = message.key.remoteJid;
            // Ignore messages from DMs, from the bot itself, or not in a group
            if (!groupId || !groupId.endsWith('@g.us') || message.key.fromMe) {
                continue;
            }

            const messageText = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
            const linkRegex = /(?:https?:\/\/)?(?:www\.)?(?:[\w-]+\.)+[a-z]{2,}(?:\/[^\s]*)?|(?:https?:\/\/)?(?:chat\.whatsapp\.com|discord\.gg|t\.me|bit\.ly|wa\.me)\/[^\s]+/gi;

            // If a link is found in the message
            if (linkRegex.test(messageText)) {
                console.log(`Detected link in group ${groupId}: ${messageText}`);
                const senderId = message.key.participant;
                if (!senderId) continue;

                const linkDetectionMode = getLinkDetectionMode(groupId) || 'warn';

                // Delete the message containing the link
                await sock.sendMessage(groupId, {
                    delete: {
                        remoteJid: groupId,
                        fromMe: false,
                        id: message.key.id
                    }
                });

                const isPdmEnabled = getPDMStatus(groupId);
                if (isPdmEnabled) {
                    await sock.sendMessage(groupId, {
                        text: `🚫 @${senderId.split('@')[0]} Links are not allowed in this group.`,
                        mentions: [senderId]
                    });
                }

                // Action: 'kick' mode
                if (linkDetectionMode === 'kick') {
                    await sock.groupParticipantsUpdate(groupId, [senderId], 'remove');
                    await sock.sendMessage(groupId, {
                        text: `🚫 @${senderId.split('@')[0]} has been removed for sending links.`,
                        mentions: [senderId]
                    });
                }
                // Action: 'warn' mode
                else if (linkDetectionMode === 'warn') {
                    const warningCount = incrementWarning(groupId, senderId);
                    await sock.sendMessage(groupId, {
                        text: `⚠️ @${senderId.split('@')[0]}, links are not allowed!\nWarning count: ${warningCount}/3`,
                        mentions: [senderId]
                    });

                    if (warningCount >= 3) {
                        await sock.groupParticipantsUpdate(groupId, [senderId], 'remove');
                        await sock.sendMessage(groupId, {
                            text: `🚫 @${senderId.split('@')[0]} has been removed after 3 warnings.`,
                            mentions: [senderId]
                        });
                        resetWarning(groupId, senderId);
                    }
                }
            }
        }
    });

    // --- Handler for Promote/Demote Notifications (PDM) ---
    sock.ev.on('group.participants.update', async (event) => {
        const {
            id: groupId,
            participants,
            action
        } = event;
        console.log('Event:', JSON.stringify(event, null, 2));

        const isPdmEnabled = getPDMStatus(groupId);
        if (!isPdmEnabled) return;

        const participantId = participants[0];

        try {
            const groupMetadata = await sock.groupMetadata(groupId);
            if (!groupMetadata) return;

            let actorId = event.author || event.actor;
            if (!actorId || actorId === participantId) {
                actorId = null; // Action was likely not performed by a specific admin (e.g. user left)
            }

            const actor = groupMetadata.participants.find(p => p.id === actorId);
            const target = groupMetadata.participants.find(p => p.id === participantId);

            const actorName = actor?.notify || actor?.name || (actorId ? actorId.split('@')[0] : 'An admin');
            const targetName = target?.notify || target?.name || participantId.split('@')[0] || 'User';

            // Handle 'promote' action
            if (action === 'promote') {
                const message = `🎉 *${actorName}* promoted *@${participantId.split('@')[0]}* (*${targetName}*) to admin.\n\n*Congratulations!* 🎉`;
                await sock.sendMessage(groupId, {
                    text: message,
                    mentions: actorId ? [actorId, participantId] : [participantId]
                });
            }

            // Handle 'demote' action
            if (action === 'demote') {
                const message = `🚫 *${actorName}* demoted *@${participantId.split('@')[0]}* (*${targetName}*) from admin.\n\n*Step back and regroup.* 😔`;
                await sock.sendMessage(groupId, {
                    text: message,
                    mentions: actorId ? [actorId, participantId] : [participantId]
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
};

module.exports = setupLinkDetection;
