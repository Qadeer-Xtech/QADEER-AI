// File: group-info.js
const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');

cmd({
    pattern: 'ginfo',
    alias: ['groupinfo'],
    desc: 'Get group information.',
    category: 'group',
    filename: __filename
}, async (bot, msg, text, { from, isGroup, isAdmins, isBotAdmins, groupMetadata, participants, reply }) => {
    
    await bot.sendMessage(from, { react: { text: '🥏', key: msg.key } });

    try {
        if (!isGroup) {
            return reply('This feature is only for groups!');
        }
        if (!isAdmins && !isBotAdmins) {
            return reply('You must be an admin to use this command.');
        }

        // Fetch group profile picture, use a random one if not available
        let groupPicUrl;
        try {
            groupPicUrl = await bot.profilePictureUrl(from, 'image');
        } catch {
            const fallbackImages = [
                'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
                // Add more fallback URLs if needed
            ];
            groupPicUrl = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
        }
        
        const groupAdmins = participants.filter(p => p.admin).map(p => `» @${p.id.split('@')[0]}`).join('\n');
        const groupOwner = groupMetadata.owner ? groupMetadata.owner.split('@')[0] : 'Not Found';
        const groupDesc = groupMetadata.desc ? groupMetadata.desc.toString() : 'No Description';

        const infoText = `*「 Group Information 」*\n\n` +
                         `*Group Name* - ${groupMetadata.subject}\n` +
                         `*Group Jid* - ${groupMetadata.id}\n` +
                         `*Participant Count* - ${groupMetadata.size}\n` +
                         `*Group Creator* - @${groupOwner}\n` +
                         `*Group Description* - ${groupDesc}\n\n` +
                         `*Group Admins* -\n${groupAdmins}\n`;
        
        await bot.sendMessage(from, {
            image: { url: groupPicUrl },
            caption: infoText,
            mentions: participants.map(p => p.id)
        }, { quoted: msg });

    } catch (error) {
        await bot.sendMessage(from, { react: { text: '❌', key: msg.key } });
        console.log(error);
        reply('❌ *An Error Occurred !!*\n\n' + error);
    }
});
