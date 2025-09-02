// session.js
const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

cmd({
    pattern: 'clearsession',
    desc: 'Clear session data to fix decryption/waiting for message errors',
    category: 'owner',
    filename: __filename
}, async (client, message, m, { from, reply, isPatron }) => {
    
    await client.sendMessage(m.key.remoteJid, { react: { text: '🧹', key: m.key } });

    try {
        if (!isPatron) {
            return reply('❌ This command is only for the bot creator!');
        }

        const sessionDir = './sessions';
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir);
        }

        fs.readdir(sessionDir, async (err, files) => {
            if (err) {
                console.error(`Unable to scan directory: ${err}`);
                return reply(`❌ Unable to scan directory: ${err}`);
            }

            if (files.length === 0) {
                return reply('✅ The sessions folder is empty. No files to delete.');
            }
            
            // Filter for session-related files, excluding 'creds.json'
            let filesToDelete = files.filter(file =>
                file.startsWith('pre-key') ||
                file.startsWith('sender-key') ||
                file.startsWith('session-') ||
                file.startsWith('app-state')
            );
            
            let report = `Detected ${filesToDelete.length} memory files <3\n\n`;

            if (filesToDelete.length === 0) {
                return reply('' + report); // If only creds.json exists
            }

            filesToDelete.map((file, index) => {
                report += `${index + 1}. ${file}\n`;
            });

            reply(report);
            await sleep(2000);
            reply('❌ Deleting memory files...');

            for (const file of filesToDelete) {
                // Double-check to never delete creds.json
                if (file !== 'creds.json') {
                    fs.unlinkSync(path.join(sessionDir, file));
                }
            }
            
            await sleep(2000);
            return reply('✅ Successfully deleted all memory files in the sessions folder (except \'creds.json\').');
        });

    } catch (error) {
        console.error('Clear session error:', error);
        return reply('❌ An error occurred while clearing session data.');
    }
});
