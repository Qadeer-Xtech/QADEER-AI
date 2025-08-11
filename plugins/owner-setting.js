const { cmd ,commands } = require('../command');
const { exec } = require('child_process');
const config = require('../config');
const {sleep} = require('../lib/functions');

// delete
cmd({
    pattern: "delete",
    react: "🗑️", // Emoji ko standard banaya gaya
    alias: ["del"],
    desc: "Delete a message (for admins/owner).",
    category: "group",
    filename: __filename
},
async (conn, m, { from, isGroup, isAdmins, isOwner }) => {
    // Permission check theek kiya gaya
    if (!isGroup) return; // Sirf groups mein kaam karega
    if (!isAdmins && !isOwner) return; // Sirf admin ya owner use kar sakta hai

    try {
        if (!m.quoted) return await conn.sendMessage(from, { text: "Please reply to a message to delete it." }, { quoted: m });
        
        // Key object banayein message delete karne ke liye
        const keyToDelete = {
            remoteJid: from,
            fromMe: m.quoted.fromMe, // Check karein ke message bot ka hai ya user ka
            id: m.quoted.id,
            participant: m.quoted.sender
        };
        
        await conn.sendMessage(from, { delete: keyToDelete });
        // Success par koi message nahi bhejte, sirf delete karte hain

    } catch (e) {
        console.error("Delete Error:", e);
        // Error message ab sirf error anay par aayega
        await conn.sendMessage(from, { text: '❌ Failed to delete message. Bot might not be an admin or message is too old.' }, { quoted: m });
    }
});

// gjid
cmd({
    pattern: "gjid",
    desc: "Get the list of JIDs for all groups the bot is part of.",
    category: "owner",
    react: "📝",
    filename: __filename
},
async (conn, m, { from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "❌ You are not the owner!" }, { quoted: m });
    
    try {
        const groups = await conn.groupFetchAllParticipating();
        const groupJids = Object.keys(groups).join('\n');
        await conn.sendMessage(from, { text: `📝 *All Group JIDs:*\n\n${groupJids}` }, { quoted: m });
    } catch (error) {
        console.error("GJiD Error:", error);
        await conn.sendMessage(from, { text: `❌ Error fetching group JIDs: ${error.message}` }, { quoted: m });
    }
});

// clear chats
cmd({
    pattern: "clearchats",
    alias: ["clear"],
    desc: "Clear all chats from the bot.",
    category: "owner",
    react: "🧹",
    filename: __filename
},
async (conn, m, { from, isOwner, store }) => { // 'store' ka istemal
    if (!isOwner) return await conn.sendMessage(from, { text: "❌ You are not the owner!" }, { quoted: m });

    try {
        // Naye Baileys ke liye store se chats hasil karein
        const allChats = store.chats.all();
        for (const chat of allChats) {
            // Har chat ko delete karein
            await conn.chatModify({ delete: true }, chat.id);
        }
        await conn.sendMessage(from, { text: "🧹 All chats cleared successfully!" }, { quoted: m });
    } catch (error) {
        console.error("ClearChats Error:", error);
        await conn.sendMessage(from, { text: `❌ Error clearing chats: ${error.message}` }, { quoted: m });
    }
});

// setpp
cmd({
    pattern: "setpp",
    desc: "Set bot profile picture.",
    category: "owner",
    react: "🖼️",
    filename: __filename
},
async (conn, m, { from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "❌ You are not the owner!" }, { quoted: m });
    if (!m.quoted || !m.quoted.message.imageMessage) return await conn.sendMessage(from, { text: "❌ Please reply to an image." }, { quoted: m });
    
    try {
        const mediaBuffer = await m.quoted.download();
        await conn.updateProfilePicture(conn.user.id, mediaBuffer);
        await conn.sendMessage(from, { text: "🖼️ Profile picture updated successfully!" }, { quoted: m });
    } catch (error) {
        console.error("SetPP Error:", error);
        await conn.sendMessage(from, { text: `❌ Error updating profile picture: ${error.message}` }, { quoted: m });
    }
});

// shutdown
cmd({
    pattern: "shutdown",
    desc: "Shutdown the bot.",
    category: "owner",
    react: "🛑",
    filename: __filename
},
async (conn, m, { from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "❌ You are not the owner!" }, { quoted: m });

    // Pehle message bhejain, phir process ko band karein
    await conn.sendMessage(from, { text: "🛑 Shutting down..." }, { quoted: m });
    
    // 2 second ka delay taake message chala jaye
    await sleep(2000); 
    
    process.exit();
});
