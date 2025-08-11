const fs = require("fs");
const config = require("../config");
const { cmd, commands } = require("../command");
const path = require('path');
const axios = require("axios");


cmd({
    pattern: "privacy",
    alias: ["privacymenu"],
    desc: "Privacy settings menu",
    category: "privacy",
    react: "🔐",
    filename: __filename
}, 
async (conn, m, { from }) => {
    try {
        let privacyMenu = `╭━━〔 *Privacy Settings* 〕━━┈⊷
┃
┃ ◈ *blocklist* - View blocked users
┃ ◈ *getbio* - Get a user's bio
┃ ◈ *getpp* - Get a user's profile picture
┃ ◈ *setpp* - Change bot's profile pic
┃ ◈ *setmyname* - Change bot's name
┃ ◈ *updatebio* - Change bot's bio
┃
┃ *--- Privacy Controls ---*
┃ ◈ *setppall* - Set profile pic privacy
┃ ◈ *setonline* - Set online privacy
┃ ◈ *groupsprivacy* - Set group add privacy
┃ ◈ *getprivacy* - View current privacy
┃
┃ *Options for Controls:*
┃ • \`all\`
┃ • \`contacts\`
┃ • \`contact_blacklist\`
┃ • \`none\`
┃ • \`match_last_seen\` (for online)
┃
╰─────────────────⎔`;

        await conn.sendMessage(from, {
            image: { url: `https://telegra.ph/file/07ce3c59a354e60f7850a.jpg` },
            caption: privacyMenu,
        }, { quoted: m });

    } catch (e) {
        console.error("Privacy Menu Error:", e);
        await conn.sendMessage(from, { text: `Error: ${e.message}` }, { quoted: m });
    }
});


cmd({
    pattern: "blocklist",
    desc: "View the list of blocked users.",
    category: "owner",
    react: "📋",
    filename: __filename
},
async (conn, m, { from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 You are not the owner!*" }, { quoted: m });

    try {
        const blockedUsers = await conn.fetchBlocklist();

        if (blockedUsers.length === 0) {
            return await conn.sendMessage(from, { text: "✅ Your block list is empty." }, { quoted: m });
        }

        let list = `*🚫 Blocked Users List (${blockedUsers.length}):*\n\n`;
        blockedUsers.forEach((user, i) => {
            list += `${i + 1}. @${user.split('@')[0]}\n`;
        });

        await conn.sendMessage(from, { text: list, mentions: blockedUsers }, { quoted: m });
    } catch (err) {
        console.error("Blocklist Error:", err);
        await conn.sendMessage(from, { text: `❌ Failed to fetch block list: ${err.message}` }, { quoted: m });
    }
});


cmd({
    pattern: "getbio",
    desc: "Displays a user's bio by replying or tagging.",
    category: "utility",
    filename: __filename,
}, async (conn, m, { from, q }) => {
    try {
        let targetJid;
        if (m.quoted) {
            targetJid = m.quoted.sender;
        } else if (m.mentionedJid?.length > 0) {
            targetJid = m.mentionedJid[0];
        } else {
            targetJid = from;
        }

        const about = await conn.fetchStatus(targetJid);
        const bioText = `*Bio of @${targetJid.split('@')[0]}:*\n\n📝 ${about.status}`;
        await conn.sendMessage(from, { text: bioText, mentions: [targetJid] }, { quoted: m });
    } catch (error) {
        await conn.sendMessage(from, { text: "No bio found for this user or their privacy settings don't allow it." }, { quoted: m });
    }
});

// Function to handle all privacy settings
const handlePrivacySetting = async (conn, m, { args, from, isOwner }, settingType, validOptions, settingName) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 You are not the owner!*" }, { quoted: m });
    
    try {
        const value = args[0]?.toLowerCase();
        if (!value || !validOptions.includes(value)) {
            const replyText = `❌ Invalid option.\n\n*Valid options for ${settingName}:*\n\`${validOptions.join('`, `')}\``;
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }
        
        await conn.updatePrivacySetting(settingType, value);
        await conn.sendMessage(from, { text: `✅ *${settingName} privacy updated to:* ${value}` }, { quoted: m });
    } catch (e) {
        console.error(`Error in ${settingName}:`, e);
        await conn.sendMessage(from, { text: `❌ An error occurred while updating ${settingName} privacy.` }, { quoted: m });
    }
};

// Profile Picture Privacy
cmd({
    pattern: "setppall", desc: "Update Profile Picture Privacy", category: "privacy", react: "🔐", filename: __filename
}, (conn, m, V) => handlePrivacySetting(conn, m, V, 'profile', ['all', 'contacts', 'contact_blacklist', 'none'], 'Profile Picture'));

// Online Presence Privacy
cmd({
    pattern: "setonline", desc: "Update Online Presence Privacy", category: "privacy", react: "🔐", filename: __filename
}, (conn, m, V) => handlePrivacySetting(conn, m, V, 'online', ['all', 'match_last_seen'], 'Online Presence'));

// Group Add Privacy
cmd({
    pattern: "groupsprivacy", desc: "Update Group Add Privacy", category: "privacy", react: "🔐", filename: __filename
}, (conn, m, V) => handlePrivacySetting(conn, m, V, 'groupadd', ['all', 'contacts', 'contact_blacklist', 'none'], 'Group Add'));


cmd({
    pattern: "setpp",
    desc: "Set bot's own profile picture.",
    category: "owner",
    react: "🖼️",
    filename: __filename
},
async (conn, m, { from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "❌ You are not the owner!" }, { quoted: m });
    if (!m.quoted || !m.quoted.message.imageMessage) return await conn.sendMessage(from, { text: "❌ Please reply to an image." }, { quoted: m });
    
    try {
        const imageBuffer = await m.quoted.download();
        await conn.updateProfilePicture(conn.user.id, imageBuffer);
        await conn.sendMessage(from, { text: "🖼️ Profile picture updated successfully!" }, { quoted: m });
    } catch (error) {
        console.error("SetPP Bot Error:", error);
        await conn.sendMessage(from, { text: `❌ Error updating profile picture: ${error.message}` }, { quoted: m });
    }
});


cmd({
    pattern: "setmyname",
    desc: "Set bot's WhatsApp display name.",
    category: "owner",
    react: "⚙️",
    filename: __filename
},
async (conn, m, { q, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "❌ You are not the owner!" }, { quoted: m });
    if (!q) return await conn.sendMessage(from, { text: "❌ Please provide a name to set." }, { quoted: m });

    try {
        await conn.updateProfileName(q);
        await conn.sendMessage(from, { text: `✅ Bot's display name has been set to: *${q}*` }, { quoted: m });
    } catch (err) {
        console.error("SetMyName Error:", err);
        await conn.sendMessage(from, { text: "❌ Failed to set display name." }, { quoted: m });
    }
});


cmd({
    pattern: "updatebio",
    react: "✍️",
    desc: "Change the Bot's bio/about.",
    category: "owner",
    filename: __filename
},
async (conn, m, { q, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: '🚫 *You must be an Owner to use this command*' }, { quoted: m });
    if (!q) return await conn.sendMessage(from, { text: '❓ *Please provide the new bio text.*' }, { quoted: m });
    if (q.length > 139) return await conn.sendMessage(from, { text: '❗ *Sorry! Character limit is 139.*' }, { quoted: m });
    
    try {
        await conn.updateProfileStatus(q);
        await conn.sendMessage(from, { text: "✔️ *New Bio has been set successfully!*" }, { quoted: m });
    } catch (e) {
        console.error("UpdateBio Error:", e);
        await conn.sendMessage(from, { text: '🚫 *An error occurred!*\n\n' + e.message }, { quoted: m });
    }
});


cmd({
    pattern: "getprivacy",
    desc: "Get the bot's current privacy settings.",
    category: "owner",
    filename: __filename
},
async (conn, m, { from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: '🚫 *You must be an Owner to use this command*' }, { quoted: m });
    
    try {
        const privacySettings = await conn.fetchPrivacySettings();
        if (!privacySettings) return await conn.sendMessage(from, { text: '🚫 *Failed to fetch privacy settings.*' }, { quoted: m });
        
        let privacyText = `╭───「 *Bot Privacy Settings* 」───◆
│
│  *Last Seen:* ${privacySettings.last}
│  *Online:* ${privacySettings.online}
│  *Profile Picture:* ${privacySettings.profile}
│  *Status:* ${privacySettings.status}
│  *Group Add:* ${privacySettings.groupadd}
│  *Read Receipts:* ${privacySettings.readreceipts}
│
╰─────────────────⎔`;
        await conn.sendMessage(from, { text: privacyText }, { quoted: m });
    } catch (e) {
        console.error("GetPrivacy Error:", e);
        await conn.sendMessage(from, { text: '🚫 *An error occurred!*\n\n' + e.message }, { quoted: m });
    }
});


cmd({
    pattern: "getpp",
    desc: "Fetch the profile picture of a user.",
    category: "utility",
    filename: __filename
}, async (conn, m, { from }) => {
    try {
        const targetJid = m.quoted ? m.quoted.sender : (m.mentionedJid?.[0] || m.sender);

        const userPicUrl = await conn.profilePictureUrl(targetJid, "image").catch(() => null);

        if (!userPicUrl) {
            return await conn.sendMessage(from, { text: "⚠️ No profile picture found for this user." }, { quoted: m });
        }

        await conn.sendMessage(from, {
            image: { url: userPicUrl },
            caption: `🖼️ Here is the profile picture of @${targetJid.split('@')[0]}`,
            mentions: [targetJid]
        });
    } catch (e) {
        console.error("GetPP Error:", e);
        await conn.sendMessage(from, { text: "❌ An error occurred while fetching the profile picture." }, { quoted: m });
    }
});
