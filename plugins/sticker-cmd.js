// sticker-cmd.js
const { cmd } = require('../command');
const fs = require('fs');
const path = require('path');
const config = require('../config.js');

// --- Setup ---
const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
const STICKER_COMMANDS_FILE = path.join(DATA_DIR, 'sticker-commands.json');
if (!fs.existsSync(STICKER_COMMANDS_FILE)) {
    fs.writeFileSync(STICKER_COMMANDS_FILE, '{}', 'utf8');
}

// --- Helper Functions ---
const saveStickerCommands = (commands) => {
    try {
        fs.writeFileSync(STICKER_COMMANDS_FILE, JSON.stringify(commands, null, 2));
    } catch (error) {
        console.error('Error saving sticker commands:', error);
    }
};

const loadStickerCommands = () => {
    try {
        if (fs.existsSync(STICKER_COMMANDS_FILE)) {
            return JSON.parse(fs.readFileSync(STICKER_COMMANDS_FILE, 'utf8'));
        }
        return {};
    } catch (error) {
        console.error('Error loading sticker commands:', error);
        return {};
    }
};

// --- Commands ---

// Set a command for a sticker
cmd({
    pattern: 'setcmd',
    desc: 'Set a sticker to execute a command',
    category: 'sticker',
    filename: __filename
}, async (client, message, m, { args, reply, isPatron }) => {
    try {
        if (!isPatron) {
            return reply('❌ This command is only for the bot creator!');
        }
        if (!args[0]) {
            return reply('❌ Please provide the command to bind to the sticker\n\n*Example:* .setcmd menu');
        }

        const commandToSet = args.join(' ').replace(/^[./!#?&^:;`~+=\-,_]/, '');

        if (!message.quoted) {
            return reply('❌ Please reply to a sticker with this command');
        }
        if (message.quoted.mtype !== 'stickerMessage') {
            return reply('❌ Please reply to a sticker (not an image or other media)');
        }

        const stickerMessage = message.quoted.msg.contextInfo?.quotedMessage?.stickerMessage;
        if (!stickerMessage) {
            return reply('❌ Could not get sticker data. Make sure you\'re replying to a sticker.');
        }

        let stickerId = null;
        if (stickerMessage.fileSha256) {
            stickerId = Buffer.from(stickerMessage.fileSha256).toString('base64');
        } else if (stickerMessage.mediaKey) {
            stickerId = Buffer.from(stickerMessage.mediaKey).toString('base64');
        }

        if (!stickerId) {
            return reply('❌ Could not get sticker identifier. Please try with a different sticker.');
        }

        const stickerCommands = loadStickerCommands();
        stickerCommands[stickerId] = commandToSet;
        saveStickerCommands(stickerCommands);

        await reply(`✅ Successfully bound sticker to the command: *${config.PREFIX}${commandToSet}*`);
    } catch (error) {
        reply(`❌ Error setting command for sticker: ${error.message}`);
    }
});

// List all sticker commands
cmd({
    pattern: 'listcmd',
    desc: 'List all sticker commands',
    category: 'sticker',
    filename: __filename
}, async (client, message, m, { reply, isPatron }) => {
    try {
        if (!isPatron) {
            return reply('❌ This command is only for the bot creator!');
        }

        const stickerCommands = loadStickerCommands();
        if (Object.keys(stickerCommands).length === 0) {
            return reply('❌ No sticker commands are set');
        }

        let listText = '*🎯 Sticker Commands List*\n\n';
        let count = 1;
        for (const [id, command] of Object.entries(stickerCommands)) {
            listText += `${count}. Command: ${config.PREFIX}${command}\n`;
            count++;
        }
        reply(listText);
    } catch (error) {
        console.error('Error in listcmd:', error);
        reply('❌ Error listing sticker commands');
    }
});

// Delete a sticker command
cmd({
    pattern: 'delcmd',
    desc: 'Delete a sticker command binding',
    category: 'sticker',
    filename: __filename
}, async (client, message, m, { reply, isPatron }) => {
    try {
        if (!isPatron) {
            return reply('❌ This command is only for the bot creator!');
        }

        if (!message.quoted || message.quoted.mtype !== 'stickerMessage') {
            return reply('❌ Please reply to the sticker whose command you want to delete');
        }

        const stickerMessage = message.msg.contextInfo?.quotedMessage?.stickerMessage;
        if (!stickerMessage) {
            return reply('❌ Could not get sticker data. Make sure you\'re replying to a sticker.');
        }

        let stickerId = null;
        if (stickerMessage.fileSha256) {
            stickerId = Buffer.from(stickerMessage.fileSha256).toString('base64');
        } else if (stickerMessage.mediaKey) {
            stickerId = Buffer.from(stickerMessage.mediaKey).toString('base64');
        }
        
        if (!stickerId) {
            return reply('❌ Could not get sticker identifier. Please try with a different sticker.');
        }

        const stickerCommands = loadStickerCommands();
        if (!stickerCommands[stickerId]) {
            return reply('❌ This sticker doesn\'t have any command bound to it');
        }

        const deletedCommand = stickerCommands[stickerId];
        delete stickerCommands[stickerId];
        saveStickerCommands(stickerCommands);

        reply(`✅ Successfully removed command binding: *${config.PREFIX}${deletedCommand}*`);
    } catch (error) {
        console.error('Error in delcmd:', error);
        reply('❌ Error deleting sticker command');
    }
});
