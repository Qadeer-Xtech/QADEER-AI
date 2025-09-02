//groupMessages.js
const { cmd } = require('../command');
const { loadSettings, saveSettings } = require('../lib/groupMessagesStorage');
const { getPDMStatus } = require('./pdmCommands');

let settings = loadSettings();
let welcomeSettings = settings.welcome || {};
let goodbyeSettings = settings.goodbye || {};

const defaultWelcomeMessage = '╭═══ ⪩『 *ᴡᴇʟᴄᴏᴍᴇ* 』⪨ ═══⊷\n❀ *ʜᴇʏ* {user}\n❀ *ɢʀᴏᴜᴘ:* {gname}\n┌──────────────────\n* *ɢʀᴏᴜᴘ ᴅᴇsᴄʀɪᴘᴛɪᴏɴ:*\n──────\n* {gdesc}\n* *ᴊᴏɪɴᴇᴅ {count}*\n* *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ǫᴀᴅᴇᴇʀ-ᴀɪ*⚡👑\n╰═══════════════⊷';
const defaultGoodbyeMessage = '╭═══ ⪩『 *ɢᴏᴏᴅʙʏᴇ* 』⪨ ═══⊷\n❀ *ʙʏᴇ* {user}\n❀ *ɢʀᴏᴜᴘ:* {gname}\n┌──────────────────\n* *ʟᴇғᴛ ᴀᴛ {count} ᴍᴇᴍʙᴇrs*\n* *© ᴘᴏᴡᴇʀᴇᴅ ʙʏ ǫᴀᴅᴇᴇʀ-ᴀɪ*⚡👑\n╰═══════════════⊷';

function formatMessage(message, user, groupName, memberCount, groupDesc) {
    const description = groupDesc || 'No description available.';
    return message
        .replace(/{user}/g, user)
        .replace(/{gname}/g, groupName || 'this group')
        .replace(/{count}/g, memberCount || '0')
        .replace(/{gdesc}/g, description);
}

// --- Welcome Command ---
cmd({
    pattern: 'welcome',
    alias: ['welc', 'wm'],
    desc: 'Manage welcome messages in groups',
    category: 'group',
    use: '[on/off]',
    filename: __filename
}, async (client, _, message, { from, args, reply, isGroup, isBotAdmins }) => {
    
    await client.sendMessage(message.key, { react: { text: '👋', key: message.key } });

    if (!isGroup) {
        return reply('❌ This command only works in groups');
    }
    if (!isBotAdmins) {
        return reply('❌ Bot needs admin rights to manage welcome messages');
    }

    try {
        if (!args.length) {
            const groupSetting = welcomeSettings[from];
            const statusMessage = groupSetting?.enabled 
                ? `✅ *Enabled*\n💬 Message: ${groupSetting.message || defaultWelcomeMessage}`
                : '❌ *Disabled*';
            return reply(`Current welcome settings:\n\n${statusMessage}\n\nUsage:\n• welcome on/off\n• welcome <custom message>\n\n📌 *Tip:* You can use these placeholders in your message:\n• {user} - mentions the new member\n• {gname} - group name\n• {count} - member count\n• {gdesc} - group description`);
        }

        const option = args[0].toLowerCase();
        if (option === 'on') {
            welcomeSettings[from] = { enabled: true, message: defaultWelcomeMessage };
        } else if (option === 'off') {
            welcomeSettings[from] = { enabled: false };
        } else {
            welcomeSettings[from] = { enabled: true, message: args.join(' ') };
        }

        settings.welcome = welcomeSettings;
        saveSettings(settings);

        const responseMessage = option === 'off'
            ? '❌ Welcome messages disabled'
            : '✅ Welcome messages enabled\n\nUsage:\n• Use welcome <custom message> to chnage default message\n\n📌 *Tip:* You can use these placeholders in your message:\n• {user} - mentions the new member\n• {gname} - group name\n• {count} - member count\n• {gdesc} - group description';
        
        return reply(responseMessage);

    } catch (error) {
        console.error('Welcome command error:', error);
        return reply('❌ Error updating welcome settings');
    }
});

// --- Goodbye Command ---
cmd({
    pattern: 'goodbye',
    alias: ['gb', 'bye'],
    desc: 'Manage goodbye messages in groups',
    category: 'group',
    use: '[on/off]',
    filename: __filename
}, async (client, _, message, { from, args, reply, isGroup, isBotAdmins }) => {

    await client.sendMessage(message.key, { react: { text: '👋', key: message.key } });

    if (!isGroup) {
        return reply('❌ This command only works in groups');
    }
    if (!isBotAdmins) {
        return reply('❌ Bot needs admin rights to manage goodbye messages');
    }

    try {
        if (!args.length) {
            const groupSetting = goodbyeSettings[from];
            const statusMessage = groupSetting?.enabled
                ? `✅ *Enabled*\n💬 Message: ${groupSetting.message || defaultGoodbyeMessage}`
                : '❌ *Disabled*';
            return reply(`Current goodbye settings:\n\n${statusMessage}\n\nUsage:\n• goodbye on/off\n• goodbye <custom message>\n\n📌 *Tip:* You can use these placeholders in your message:\n• {user} - mentions the leaving member\n• {gname} - group name\n• {count} - member count\n• {gdesc} - group description`);
        }

        const option = args[0].toLowerCase();
        if (option === 'on') {
            goodbyeSettings[from] = { enabled: true, message: defaultGoodbyeMessage };
        } else if (option === 'off') {
            goodbyeSettings[from] = { enabled: false };
        } else {
            goodbyeSettings[from] = { enabled: true, message: args.join(' ') };
        }

        settings.goodbye = goodbyeSettings;
        saveSettings(settings);
        
        const responseMessage = option === 'off'
            ? '❌ Goodbye messages disabled'
            : '✅ Goodbye messages enabled\nUsage:\n• goodbye <custom message> to chnage default message\n\n📌 *Tip:* You can use these placeholders in your message:\n• {user} - mentions the leaving member\n• {gname} - group name\n• {count} - member count\n• {gdesc} - group description';

        return reply(responseMessage);

    } catch (error) {
        console.error('Goodbye command error:', error);
        return reply('❌ Error updating goodbye settings');
    }
});

// --- Group Event Handler ---
function registerGroupMessages(client) {
    client.ev.on('group-participants.update', async (update) => {
        const groupId = update.id;

        try {
            if (!client?.ws || client.ws.readyState !== 1) return;

            const metadata = await client.groupMetadata(groupId);
            const groupName = metadata?.subject || 'this group';
            const memberCount = metadata?.participants?.length || 0;
            const groupDesc = metadata?.desc?.toString() || metadata?.description?.toString() || 'No description available.';

            const sendMessageForParticipant = async (participantId, isWelcome) => {
                const settings = isWelcome ? welcomeSettings[groupId] : goodbyeSettings[groupId];
                if (!settings?.enabled) return;

                const messageTemplate = settings.message || (isWelcome ? defaultWelcomeMessage : defaultGoodbyeMessage);
                
                let profilePicUrl;
                try {
                    profilePicUrl = await client.profilePictureUrl(participantId, 'image');
                } catch {
                    profilePicUrl = 'https://qu.ax/Pusls.jpg';
                }

                let pushname;
                try {
                    const status = await client.fetchStatus(participantId);
                    pushname = status?.pushname || participantId.split('@')[0];
                } catch {
                    pushname = participantId.split('@')[0];
                }
                
                const userMention = '@' + participantId.split('@')[0];
                const formattedText = formatMessage(messageTemplate, userMention, groupName, memberCount, groupDesc)
                    .replace(/{user}/g, `${userMention} (${pushname})`);
                
                await client.sendMessage(groupId, {
                    image: { url: profilePicUrl },
                    caption: formattedText,
                    mentions: [participantId]
                });
            };

            if (update.action === 'add') {
                for (const participant of update.participants) {
                    await sendMessageForParticipant(participant, true);
                }
            } else if (update.action === 'remove') {
                for (const participant of update.participants) {
                    await sendMessageForParticipant(participant, false);
                }
            } else if (update.action === 'promote' || update.action === 'demote') {
                if (getPDMStatus && getPDMStatus(groupId)) {
                    for (const participant of update.participants) {
                        const author = update.author || update.actor || participant;
                        const actionText = update.action === 'promote' ? 'promoted' : 'demoted';
                        const emoji = update.action === 'promote' ? '🎉' : '🚫';

                        await client.sendMessage(groupId, {
                            text: `${emoji} *@${author.split('@')[0]}* ${actionText} *@${participant.split('@')[0]}*`,
                            mentions: [author, participant]
                        });
                    }
                }
            }
        } catch (error) {
            // Ignore common errors for groups that no longer exist or where the bot is not a participant
            if (error?.message === 'item-not-found' || error?.message === 'forbidden' || error?.data === 403 || error?.data === 404) {
                return;
            }
            console.error('Group update handler error:', error);
        }
    });
}

module.exports = { registerGroupMessages };
