// tool-broadcast.js
const { cmd } = require('../command');
const config = require('../config');
const { sleep } = require('../lib/functions2');

cmd({
    pattern: 'broadcast2',
    category: 'group',
    desc: 'Bot makes a broadcast in all groups',
    filename: __filename,
    use: '<text for broadcast.>'
}, async (client, message, m, { q, isGroup, reply }) => {

    try {
        if (!isGroup) {
            return reply('❌ This command can only be used in groups!');
        }
        if (!q) {
            return reply('❌ Provide text to broadcast in all groups!');
        }

        let allGroupsMetadata = await client.groupFetchAllParticipating();
        let groupJids = Object.keys(allGroupsMetadata);
        
        reply(`📢 Sending Broadcast To ${groupJids.length} Groups...\n⏳ Estimated Time: ${groupJids.length * 1.5} seconds`);

        for (let jid of groupJids) {
            try {
                await sleep(1500); // 1.5 second delay
                await client.sendMessage(jid, { text: q });
            } catch (err) {
                console.log(`❌ Failed to send broadcast to ${jid}:`, err);
            }
        }

        return reply(`✅ Successfully sent broadcast to ${groupJids.length} groups!`);

    } catch (error) {
        await m.error(`❌ Error: ${error}\n\nCommand: broadcast`, error);
    }
});
