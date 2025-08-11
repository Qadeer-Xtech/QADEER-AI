const { cmd } = require('../command');
const config = require('../config');

// Stylized characters ka object
const stylizedChars = {
    a: '🅐', b: '🅑', c: '🅒', d: '🅓', e: '🅔', f: '🅕', g: '🅖',
    h: '🅗', i: '🅘', j: '🅙', k: '🅚', l: '🅛', m: '🅜', n: '🅝',
    o: '🅞', p: '🅟', q: '🅠', r: '🅡', s: '🅢', t: '🅣', u: '🅤',
    v: '🅥', w: '🅦', x: '🅧', y: '🅨', z: '🅩',
    '0': '⓿', '1': '➊', '2': '➋', '3': '➌', '4': '➍',
    '5': '➎', '6': '➏', '7': '➐', '8': '➑', '9': '➒'
};

cmd({
    pattern: "chr",
    alias: ["creact"],
    react: "🔤",
    desc: "React to channel messages with stylized text",
    category: "whatsapp",
    filename: __filename
},
async (conn, m, { q, from, isOwner, command }) => { // Parameters ko saaf kiya gaya
    try {
        if (!isOwner) {
            return await conn.sendMessage(from, { text: "❌ *Owner only command*" }, { quoted: m });
        }

        if (!q) {
            const replyText = `*Usage Example:*\n${config.PREFIX}${command} https://whatsapp.com/channel/0029Va9xT2y.../17 hello`;
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }

        const [link, ...textParts] = q.split(' ');
        if (!link.includes("whatsapp.com/channel/")) {
            return await conn.sendMessage(from, { text: "⚠️ *Invalid channel link format.*" }, { quoted: m });
        }

        const inputText = textParts.join(' ').toLowerCase();
        if (!inputText) {
            return await conn.sendMessage(from, { text: "Please provide text to react with." }, { quoted: m });
        }

        // Text ko stylized emoji mein convert karein
        const emojiReaction = inputText
            .split('')
            .map(char => {
                if (char === ' ') return '―'; // Space ke liye alag character
                return stylizedChars[char] || char;
            })
            .join('');

        // Link se Channel ID aur Message ID nikalain
        const linkParts = link.split('/');
        const channelInviteCode = linkParts[4];
        const messageId = linkParts[5];

        if (!channelInviteCode || !messageId) {
            return await conn.sendMessage(from, { text: "Invalid link - missing Channel or Message ID." }, { quoted: m });
        }

        // Channel ka JID hasil karein
        const channelMeta = await conn.newsletterMetadata("invite", channelInviteCode);
        
        // Channel ke message par react karein
        await conn.newsletterReactMessage(channelMeta.id, messageId, emojiReaction);

        // Success ka message bhej dein
        const successText = `╭━━〔 *Channel Reaction* 〕━┈⊷
┃▸ ✅ *Success!* Reaction sent.
┃▸ *Channel:* ${channelMeta.name}
┃▸ *Reaction:* ${emojiReaction}
╰────────────────┈⊷`;
        await conn.sendMessage(from, { text: successText }, { quoted: m });

    } catch (e) {
        console.error("Channel React Error:", e);
        const errorText = `❎ *Error:* ${e.message || "Failed to send reaction. The bot might not be in the channel or the library needs an update."}`;
        await conn.sendMessage(from, { text: errorText }, { quoted: m });
    }
});
