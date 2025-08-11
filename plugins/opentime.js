const { cmd } = require('../command');

// Time duration parse karne ka function
function parseDuration(value, unit) {
    if (!unit) return null; // Agar unit na ho to null return karein
    const multipliers = {
        second: 1000, seconds: 1000,
        minute: 60000, minutes: 60000,
        hour: 3600000, hours: 3600000,
        day: 86400000, days: 86400000
    };
    if (isNaN(value)) return null;
    return multipliers[unit.toLowerCase()] ? parseInt(value) * multipliers[unit.toLowerCase()] : null;
}

// --- .opentime Command ---
cmd({
    pattern: "opentime",
    react: "🔓",
    desc: "Temporarily open a group for a specific time.",
    category: "group",
    use: ".opentime 10 minutes",
    filename: __filename
}, async (conn, m, { args, from, isGroup, isAdmins }) => {
    try {
        if (!isGroup) return await conn.sendMessage(from, { text: "This command only works in groups." }, { quoted: m });
        if (!isAdmins) return await conn.sendMessage(from, { text: "Only group admins can use this command." }, { quoted: m });

        const timer = parseDuration(args[0], args[1]);
        if (!timer) {
            const replyText = "*Invalid format.*\n\n*Choose a valid unit:*\n`seconds`, `minutes`, `hours`, `days`\n\n*Example:*\n.opentime 10 minutes";
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }

        const replyText = `*Group will be opened for ${args[0]} ${args[1]}.*`;
        await conn.sendMessage(from, { text: replyText }, { quoted: m });
        
        await conn.groupSettingUpdate(from, 'not_announcement');

        setTimeout(async () => {
            await conn.groupSettingUpdate(from, 'announcement');
            await conn.sendMessage(from, { text: `*⏱️ TIME'S UP*\nGroup is now closed. Only admins can send messages. 🔐` });
        }, timer);

    } catch (e) {
        await conn.sendMessage(from, { text: "*An error occurred while opening the group.*" }, { quoted: m });
        console.error("Opentime Error:", e);
    }
});


// --- .closetime Command ---
cmd({
    pattern: "closetime",
    react: "🔐",
    desc: "Temporarily close a group for a specific time.",
    category: "group",
    use: ".closetime 10 minutes",
    filename: __filename
}, async (conn, m, { args, from, isGroup, isAdmins }) => {
    try {
        if (!isGroup) return await conn.sendMessage(from, { text: "This command only works in groups." }, { quoted: m });
        if (!isAdmins) return await conn.sendMessage(from, { text: "Only group admins can use this command." }, { quoted: m });

        const timer = parseDuration(args[0], args[1]);
        if (!timer) {
            const replyText = "*Invalid format.*\n\n*Choose a valid unit:*\n`seconds`, `minutes`, `hours`, `days`\n\n*Example:*\n.closetime 10 minutes";
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }

        const replyText = `*Group will be closed for ${args[0]} ${args[1]}.*`;
        await conn.sendMessage(from, { text: replyText }, { quoted: m });
        
        await conn.groupSettingUpdate(from, 'announcement');

        setTimeout(async () => {
            await conn.groupSettingUpdate(from, 'not_announcement');
            await conn.sendMessage(from, { text: `*⏱️ TIME'S UP*\nGroup is now open. All members can send messages. 🔓` });
        }, timer);

    } catch (e) {
        await conn.sendMessage(from, { text: "*An error occurred while closing the group.*" }, { quoted: m });
        console.error("Closetime Error:", e);
    }
});
