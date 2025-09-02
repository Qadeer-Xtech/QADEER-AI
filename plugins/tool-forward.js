// tool-forward.js
const { cmd } = require('../command');

const SAFETY = {
    MAX_JIDS: 20,
    BASE_DELAY: 2000, // 2 seconds
    EXTRA_DELAY: 4000 // 4 seconds
};

cmd({
    pattern: 'forward',
    alias: ['fwd'],
    desc: 'Bulk forward media to groups',
    category: 'owner',
    filename: __filename
}, async (client, message, m, { isOwner }) => {
    try {
        if (!isOwner) return await message.reply('*📛 Owner Only Command*');
        if (!message.quoted) return await message.reply('*🍁 Please reply to a message*');

        let jidInput = '';
        if (typeof m === 'string') {
            jidInput = m.trim();
        } else if (Array.isArray(m)) {
            jidInput = m.join(' ').trim();
        } else if (m && typeof m === 'object') {
            jidInput = m.text || '';
        }

        const jidsRaw = jidInput.split(/[\s,]+/);
        const jids = jidsRaw
            .filter(j => j.trim().length > 0)
            .map(j => {
                const cleanJid = j.replace(/@g\.us$/i, '');
                return /^\d+$/.test(cleanJid) ? `${cleanJid}@g.us` : null;
            })
            .filter(j => j !== null)
            .slice(0, SAFETY.MAX_JIDS);

        if (jids.length === 0) {
            return await message.reply(
                '❌ No valid group JIDs found\n' +
                'Examples:\n' +
                '.fwd 120363411055156472@g.us,120363333939099948@g.us\n' +
                '.fwd 120363411055156472 120363333939099948'
            );
        }

        let forwardMessage = {};
        const quotedMsg = message.quoted;
        const msgType = quotedMsg.mtype;

        if (['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(msgType)) {
            const buffer = await quotedMsg.download();
            switch (msgType) {
                case 'imageMessage':
                    forwardMessage = { image: buffer, caption: quotedMsg.text || '', mimetype: quotedMsg.mimetype || 'image/jpeg' };
                    break;
                case 'videoMessage':
                    forwardMessage = { video: buffer, caption: quotedMsg.text || '', mimetype: quotedMsg.mimetype || 'video/mp4' };
                    break;
                case 'audioMessage':
                    forwardMessage = { audio: buffer, mimetype: quotedMsg.mimetype || 'audio/mp4', ptt: quotedMsg.ptt || false };
                    break;
                case 'stickerMessage':
                    forwardMessage = { sticker: buffer, mimetype: quotedMsg.mimetype || 'image/webp' };
                    break;
                case 'documentMessage':
                    forwardMessage = { document: buffer, mimetype: quotedMsg.mimetype || 'application/octet-stream', fileName: quotedMsg.fileName || 'document' };
                    break;
            }
        } else if (msgType === 'conversation' || msgType === 'extendedTextMessage') {
            forwardMessage = { text: quotedMsg.text };
        } else {
             try {
                forwardMessage = message.quoted;
             } catch (e) {
                return await message.reply('❌ Unsupported message type');
             }
        }
        
        let successCount = 0;
        const failedJids = [];

        for (const [index, jid] of jids.entries()) {
            try {
                await client.sendMessage(jid, forwardMessage);
                successCount++;
                if ((index + 1) % 10 === 0) {
                    await message.reply(`🔄 Sent to ${index + 1}/${jids.length} groups...`);
                }
                const delay = (index + 1) % 10 === 0 ? SAFETY.EXTRA_DELAY : SAFETY.BASE_DELAY;
                await new Promise(resolve => setTimeout(resolve, delay));
            } catch (error) {
                failedJids.push(jid.replace('@g.us', ''));
                await new Promise(resolve => setTimeout(resolve, SAFETY.BASE_DELAY));
            }
        }

        let summary = `✅ *Forward Complete*\n\n` +
                      `📤 Success: ${successCount}/${jids.length}\n` +
                      `📦 Content Type: ${msgType.replace('Message', '') || 'text'}\n`;

        if (failedJids.length > 0) {
            summary += `\n❌ Failed (${failedJids.length}): ${failedJids.slice(0, 5).join(', ')}`;
            if (failedJids.length > 5) {
                summary += ` +${failedJids.length - 5} more`;
            }
        }

        if (jidsRaw.length > SAFETY.MAX_JIDS) {
            summary += `\n⚠️ Note: Limited to first ${SAFETY.MAX_JIDS} JIDs`;
        }
        
        await message.reply(summary);
    } catch (error) {
        console.error("Forward Error:", error);
        await message.reply(
            `💢 Error: ${error.message.substring(0, 100)}\n\n` +
            'Please try again or check:\n' +
            '1. JID formatting\n' +
            '2. Media type support\n' +
            '3. Bot permissions'
        );
    }
});
