const { cmd } = require("../command");
const fs = require("fs");
const path = require("path");

// FIX 1: Wohi standard file path istemal kiya gaya hai
const reportFilePath = path.join(__dirname, "../data/reports.json");

cmd({
    pattern: "deletereport",
    alias: ["delreport"],
    desc: "Delete a specific report by its index.",
    category: "owner",
    react: "🗑️",
    filename: __filename,
    use: "<report number>"
}, async (conn, m, { args, from }) => {
    try {
        const devNumbers = ["923151105391", "923079749129", "923498344152"];
        const senderId = m.sender.split("@")[0];

        if (!devNumbers.includes(senderId)) {
            return await conn.sendMessage(from, { text: "❌ *Only developers can use this command.*" }, { quoted: m });
        }
        
        if (!fs.existsSync(reportFilePath)) {
            return await conn.sendMessage(from, { text: "❌ No reports file found." }, { quoted: m });
        }

        const index = parseInt(args[0]);
        if (isNaN(index) || index < 1) {
            const replyText = `❌ Please provide a valid report number.\n\n*Example:* .deletereport 2`;
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }

        let reports = JSON.parse(fs.readFileSync(reportFilePath, 'utf8'));

        if (index > reports.length || reports.length === 0) {
            const replyText = `❌ Invalid report number. There are only ${reports.length} reports.`;
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }

        const removed = reports.splice(index - 1, 1)[0];
        fs.writeFileSync(reportFilePath, JSON.stringify(reports, null, 2));

        const successText = `✅ *Deleted report #${index}*\n\n*From:* @${removed.user}\n*Message:* ${removed.message}`;
        await conn.sendMessage(from, {
            text: successText,
            mentions: [`${removed.user}@s.whatsapp.net`]
        }, {
            quoted: m
        });

    } catch (err) {
        console.error("Deletereport Error:", err);
        await conn.sendMessage(from, { text: "❌ An unexpected error occurred." }, { quoted: m });
    }
});
