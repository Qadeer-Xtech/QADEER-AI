const { cmd } = require("../command");
const config = require("../config");
const fs = require("fs");
const path = require("path");

// FIX 1: Hum ek hi file path ko dono commands ke liye istemal karenge
const reportFilePath = path.join(__dirname, "../data/reports.json");

// --- Command .report ---
cmd({
    pattern: "report",
    alias: ["ask", "bug", "request"],
    desc: "Report a bug or request a feature.",
    category: "new",
    react: "👨‍💻", // React ko array se bahar nikala
    filename: __filename
}, async (conn, m, { args, from, sender, pushName }) => { // Standard parameters
    try {
        if (!args.length) {
            const replyText = `❌ Please describe your issue.\n\n*Example:* ${config.PREFIX}report Play command is not working`;
            return await conn.sendMessage(from, { text: replyText }, { quoted: m });
        }

        const devNumbers = ["923151105391", "923498344152", "923079749129"];
        const reportMessage = args.join(" ");
        const reportTime = new Date().toISOString(); // UTC format behtar hai

        // Report ko file mein save karein
        const reports = fs.existsSync(reportFilePath) ? JSON.parse(fs.readFileSync(reportFilePath, 'utf8')) : [];
        reports.push({
            user: sender.split("@")[0],
            message: reportMessage,
            time: reportTime // 'time' key istemal ho rahi hai
        });
        fs.writeFileSync(reportFilePath, JSON.stringify(reports, null, 2));

        // Report developers ko bhejain
        const reportToDevText = `*| ⚠️ NEW REPORT ⚠️ |*\n\n*From User:* @${sender.split("@")[0]}\n*Message:* ${reportMessage}`;
        for (const number of devNumbers) {
            await conn.sendMessage(`${number}@s.whatsapp.net`, {
                text: reportToDevText,
                mentions: [sender]
            });
        }
        
        // User ko confirmation bhejain
        const confirmationText = `✅ Thanks ${pushName || "user"}, your report has been sent to the developers.`;
        await conn.sendMessage(from, { text: confirmationText }, { quoted: m });

    } catch (error) {
        console.error("Report Error:", error);
        await conn.sendMessage(from, { text: "❌ Failed to send your report." }, { quoted: m });
    }
});


// --- Command .reportlist ---
cmd({
    pattern: "reportlist",
    alias: ["reports"],
    desc: "Show all bug reports/requests.",
    category: "owner", // Yeh owner ke liye honi chahiye
    filename: __filename
}, async (conn, m, { from }) => { // Standard parameters
    try {
        // FIX 1: Wohi standard file path istemal kiya gaya hai
        if (!fs.existsSync(reportFilePath)) {
            return await conn.sendMessage(from, { text: "✅ The report list is empty." }, { quoted: m });
        }
        
        const reports = JSON.parse(fs.readFileSync(reportFilePath, 'utf8'));

        if (!reports.length) {
            return await conn.sendMessage(from, { text: "✅ The report list is empty." }, { quoted: m });
        }

        let reportListText = "*📋 All User Reports:*\n\n";
        let mentionedUsers = [];

        reports.forEach((item, i) => {
            // FIX 2: 'item.timestamp' ko 'item.time' se badla gaya
            const reportDate = new Date(item.time).toLocaleString('en-GB', { timeZone: "Asia/Karachi" });
            reportListText += `*${i + 1}. From:* @${item.user}\n* Message:* ${item.message}\n* Time:* ${reportDate}\n\n`;
            mentionedUsers.push(`${item.user}@s.whatsapp.net`);
        });

        await conn.sendMessage(from, { text: reportListText, mentions: mentionedUsers }, { quoted: m });
        
    } catch (err) {
        console.error("Reportlist Error:", err);
        await conn.sendMessage(from, { text: "❌ Error reading the report list." }, { quoted: m });
    }
});
