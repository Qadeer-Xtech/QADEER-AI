const { cmd } = require('../command');

cmd({
    pattern: "block",
    desc: "Blocks a person by mention, reply, or number.",
    category: "owner",
    react: "🚫",
    filename: __filename
},
async (conn, m, { reply, q, react }) => {
    // Get the bot owner's number dynamically
    const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net";
    
    if (m.sender !== botOwner) {
        await react("❌");
        return reply("Only the bot owner can use this command.");
    }

    let jid;
    if (m.quoted) {
        // Block by replying to a message
        jid = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        // Block by mentioning a user
        jid = m.mentionedJid[0];
    } else if (q) {
        // Block by providing the number directly
        const number = q.replace(/[^0-9]/g, ''); // Remove any non-digit characters
        if (!number) {
            await react("❌");
            return reply("Please provide a valid number.");
        }
        jid = number + "@s.whatsapp.net";
    } else {
        // If no user is specified
        await react("❌");
        return reply("Please mention a user, reply to their message, or provide their number to block.");
    }

    try {
        await conn.updateBlockStatus(jid, "block");
        await react("✅");
        reply(`Successfully blocked @${jid.split("@")[0]}`, { mentions: [jid] });
    } catch (error) {
        console.error("Block command error:", error);
        await react("❌");
        reply("Failed to block the user. They might already be blocked or the number is invalid.");
    }
});

cmd({
    pattern: "unblock",
    desc: "Unblocks a person by mention, reply, or number.",
    category: "owner",
    react: "🔓",
    filename: __filename
},
async (conn, m, { reply, q, react }) => {
    // Get the bot owner's number dynamically
    const botOwner = conn.user.id.split(":")[0] + "@s.whatsapp.net";

    if (m.sender !== botOwner) {
        await react("❌");
        return reply("Only the bot owner can use this command.");
    }

    let jid;
    if (m.quoted) {
        // Unblock by replying to a message
        jid = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        // Unblock by mentioning a user
        jid = m.mentionedJid[0];
    } else if (q) {
        // Unblock by providing the number directly
        const number = q.replace(/[^0-9]/g, ''); // Remove any non-digit characters
        if (!number) {
            await react("❌");
            return reply("Please provide a valid number.");
        }
        jid = number + "@s.whatsapp.net";
    } else {
        // If no user is specified
        await react("❌");
        return reply("Please mention a user, reply to their message, or provide their number to unblock.");
    }

    try {
        await conn.updateBlockStatus(jid, "unblock");
        await react("✅");
        reply(`Successfully unblocked @${jid.split("@")[0]}`, { mentions: [jid] });
    } catch (error) {
        console.error("Unblock command error:", error);
        await react("❌");
        reply("Failed to unblock the user. They might already be unblocked or the number is invalid.");
    }
});
