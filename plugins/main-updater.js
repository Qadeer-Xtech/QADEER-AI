const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { setCommitHash, getCommitHash } = require('../data/updateDB'); // Custom functions to store/retrieve commit hash

/**
 * Recursively copies a folder's contents to a destination,
 * skipping specific configuration files to preserve settings.
 *
 * @param {string} source - The source folder path.
 * @param {string} destination - The destination folder path.
 */
function copyFolderSync(source, destination) {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    const files = fs.readdirSync(source);

    for (const file of files) {
        const sourcePath = path.join(source, file);
        const destinationPath = path.join(destination, file);

        // A list of files to NOT overwrite during an update
        const filesToSkip = ['config.js', 'app.json', 'package.json', 'index.js'];

        if (filesToSkip.includes(file)) {
            console.log(`Skipping ${file} to preserve custom settings.`);
            continue; // Move to the next file
        }

        // If it's a directory, recurse. Otherwise, copy the file.
        if (fs.lstatSync(sourcePath).isDirectory()) {
            copyFolderSync(sourcePath, destinationPath);
        } else {
            fs.copyFileSync(sourcePath, destinationPath);
        }
    }
}


// Define the bot command for updating
cmd({
    pattern: 'update',
    alias: ['sync', 'upgrade'],
    react: '🆕',
    desc: 'Update the bot to the latest version.',
    category: 'owner',
    filename: __filename,
}, async (conn, mek, m, { reply, isOwner }) => {

    if (!isOwner) {
        return reply('This command is only for the bot owner.');
    }

    try {
        await reply('🔍 Checking for QADEER-AI updates...');

        // 1. Get the latest commit hash from the GitHub repository
        const { data: commitData } = await axios.get('https://api.github.com/repos/Qadeer-Xtech/QADEER-AI/commits/main');
        const latestCommitSha = commitData.sha;

        // 2. Get the currently stored commit hash
        const localCommitSha = await getCommitHash();

        // 3. Compare hashes to see if an update is needed
        if (latestCommitSha === localCommitSha) {
            return reply('✅ Your QADEER-AI bot is already up-to-date!');
        }

        await reply('QADEER-AI UPDATING WAIT PLEASE...');

        // 4. Download the latest version of the repository as a zip file
        const zipPath = path.join(__dirname, 'latest.zip');
        const { data: zipBuffer } = await axios.get('https://github.com/Qadeer-Xtech/QADEER-AI/archive/main.zip', {
            responseType: 'arraybuffer'
        });
        fs.writeFileSync(zipPath, zipBuffer);

        await reply('📦 Extracting the latest code...');

        // 5. Extract the downloaded zip file
        const extractPath = path.join(__dirname, 'latest');
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        await reply('🔄 Replacing files...');

        // 6. Copy the new files to the bot's root directory
        const sourcePath = path.join(extractPath, 'QADEER-AI-main');
        const destinationPath = path.join(__dirname, '..'); // Bot's root directory
        copyFolderSync(sourcePath, destinationPath);

        // 7. Update the local commit hash to the latest one
        await setCommitHash(latestCommitSha);

        // 8. Clean up the downloaded zip and extracted folder
        fs.unlinkSync(zipPath);
        fs.rmSync(extractPath, { recursive: true, force: true });

        await reply('✅ Update complete! Restarting the bot...');

        // 9. Exit the current process to allow a process manager (like PM2) to restart it
        process.exit(0);

    } catch (error) {
        console.error('Update error:', error);
        return reply('❌ Update failed. Please try manually.');
    }
});
