const fs = require("fs");
const path = require('path');
const { cmd } = require('../command');

// File ka path jahan password save hoga
const filePath = path.join(__dirname, '../data/password.json');

// Helper function password save karne ke liye
function setPassword(newPass) {
    fs.writeFileSync(filePath, JSON.stringify({ send_password: newPass }, null, 2));
}

// --- Command: .setpassword ---
cmd({
    pattern: "setpassword",
    desc: "Change password for the .share command.",
    category: "owner",
    filename: __filename,
    react: "🔐",
}, async (conn, m, { q, from, isOwner }) => {
    // Standard aur secure owner check
    if (!isOwner) {
        return await conn.sendMessage(from, { text: "*📛 This is an owner-only command.*" }, { quoted: m });
    }
    if (!q || q.trim().length < 4) {
        return await conn.sendMessage(from, { text: "❗ Usage: .setpassword <new_password> (min 4 characters)" }, { quoted: m });
    }

    try {
        const newPassword = q.trim();
        setPassword(newPassword);
        await conn.sendMessage(from, { text: `✅ New password saved: *${newPassword}*` }, { quoted: m });
    } catch (e) {
        console.error("SetPassword Error:", e);
        await conn.sendMessage(from, { text: "❌ Error saving the password." }, { quoted: m });
    }
});

// --- Command: .share ---
const delay = ms => new Promise(res => setTimeout(res, ms));

cmd({
    pattern: "share",
    desc: "Send a text message to all groups (password protected).",
    category: "owner",
    filename: __filename,
    react: "📢",
}, async (conn, m, { q, from, isOwner }) => {
    if (!isOwner) {
        return await conn.sendMessage(from, { text: "*📛 This is an owner-only command.*" }, { quoted: m });
    }
    
    if (!q) {
        return await conn.sendMessage(from, { text: "⚠️ Usage: .share <password> <message>" }, { quoted: m });
    }

    const [pass, ...msgParts] = q.trim().split(" ");
    const message = msgParts.join(" ");

    let savedPassword = "";
    if (fs.existsSync(filePath)) {
        try {
            const data = JSON.parse(fs.readFileSync(filePath));
            savedPassword = data.send_password || "";
        } catch {
            return await conn.sendMessage(from, { text: "❌ Password file is corrupted." }, { quoted: m });
        }
    }

    if (pass !== savedPassword) {
        return await conn.sendMessage(from, { text: "❌ Incorrect password!" }, { quoted: m });
    }
    if (!message) {
        return await conn.sendMessage(from, { text: "✏️ Please enter a message to send." }, { quoted: m });
    }

    try {
        const groups = await conn.groupFetchAllParticipating();
        const groupIds = Object.keys(groups);

        if (groupIds.length === 0) {
            return await conn.sendMessage(from, { text: "❌ I'm not in any group." }, { quoted: m });
        }

        await conn.sendMessage(from, { text: `🚀 Sending message to ${groupIds.length} groups...` }, { quoted: m });

        let sent = 0;
        let failed = 0;

        for (const jid of groupIds) {
            try {
                await conn.sendMessage(jid, {
                    text: message,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true
                    }
                });
                sent++;
            } catch (err) {
                failed++;
                console.error(`Error sending to ${jid}: ${err.message}`);
            }
            await delay(500); // 500ms ka delay spam se bachne ke liye
        }

        const reportText = `✅ *Broadcast Complete:*\n\n✔️ *Success:* ${sent}\n❌ *Failed:* ${failed}`;
        await conn.sendMessage(from, { text: reportText }, { quoted: m });
        
    } catch (e) {
        console.error("Share Command Error:", e);
        await conn.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: m });
    }
});

// --- Command: .viewpassword ---
cmd({
    pattern: "viewpassword",
    desc: "View the current password for .share command.",
    category: "owner",
    filename: __filename,
    react: "🛡️",
}, async (conn, m, { from, isOwner }) => {
    if (!isOwner) {
        return await conn.sendMessage(from, { text: "*📛 This is an owner-only command.*" }, { quoted: m });
    }
    
    try {
        if (!fs.existsSync(filePath)) {
            return await conn.sendMessage(from, { text: "❌ No password has been set yet. Use `.setpassword` to set one." }, { quoted: m });
        }
        const data = JSON.parse(fs.readFileSync(filePath));
        await conn.sendMessage(from, { text: `🔐 Current password: *${data.send_password}*` }, { quoted: m });
    } catch (e) {
        console.error("ViewPassword Error:", e);
        await conn.sendMessage(from, { text: "❌ Error reading the password." }, { quoted: m });
    }
});
