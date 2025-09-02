// filter.js

const fs = require('fs');
const path = require('path');
const { cmd } = require('../command');
const { exec } = require('child_process');

// Define paths for filter data files
const pfilterPath = path.join(__dirname, '../lib/pfilter.json');
const gfilterPath = path.join(__dirname, '../lib/gfilter.json');

// Load existing filters from files, or create empty objects if files don't exist
let pfilter = fs.existsSync(pfilterPath) ? JSON.parse(fs.readFileSync(pfilterPath)) : {};
let gfilter = fs.existsSync(gfilterPath) ? JSON.parse(fs.readFileSync(gfilterPath)) : {};

/**
 * Saves the current private filters to pfilter.json.
 */
function savePFilter() {
    fs.writeFileSync(pfilterPath, JSON.stringify(pfilter, null, 2));
}

/**
 * Saves the current group filters to gfilter.json.
 */
function saveGFilter() {
    fs.writeFileSync(gfilterPath, JSON.stringify(gfilter, null, 2));
}

/**
 * Restarts the bot using PM2.
 * @param {function} reply - The reply function to notify about the restart.
 */
function restartBot(reply) {
    exec('pm2 restart QADEER-AI', (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Error restarting bot: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`❌ Error: ${stderr}`);
            return;
        }
        console.log(`✅ Bot restarted successfully: ${stdout}`);
    });
}

// --- Command to set a private filter ---
cmd({
    pattern: 'pfilter',
    desc: 'Set a private chat auto-reply filter.',
    category: 'owner',
    filename: __filename,
    use: '<trigger> | <response>'
}, async (sock, m, message, { args, reply, isPatron, isGroup }) => {
    if (!isPatron) return reply('*📛 This command is restricted to owners only.*');
    if (isGroup) return reply('❌ This command is for private chat only.');
    if (!args[0]) return reply('Example: .pfilter hi | hello');

    let [trigger, response] = args.join(' ').split('|').map(v => v.trim());
    if (!trigger || !response) return reply('❌ Invalid format. Example: .pfilter hi | hello');

    const action = pfilter[trigger.toLowerCase()] ? 'Updated' : 'Added';
    pfilter[trigger.toLowerCase()] = response;
    savePFilter();
    await reply(`✅ ${action} private filter:\n\nWhen someone says *${trigger}*, the bot will reply with *${response}*`);
    restartBot(reply);
});

// --- Command to set a group filter ---
cmd({
    pattern: 'gfilter',
    desc: 'Set a group chat auto-reply filter.',
    category: 'owner',
    filename: __filename,
    use: '<trigger> | <response>'
}, async (sock, m, message, { args, reply, isPatron, isGroup }) => {
    if (!isPatron) return reply('*📛 This command is restricted to owners only.*');
    if (!isGroup) return reply('❌ This command is for group chats only.');
    if (!args[0]) return reply('Example: .gfilter welcome | hey there');
    
    let [trigger, response] = args.join(' ').split('|').map(v => v.trim());
    if (!trigger || !response) return reply('❌ Invalid format. Example: .gfilter welcome | hey there');
    
    const action = gfilter[trigger.toLowerCase()] ? 'Updated' : 'Added';
    gfilter[trigger.toLowerCase()] = response;
    saveGFilter();
    await reply(`✅ ${action} group filter:\n\nWhen someone says *${trigger}*, the bot will reply with *${response}*`);
    restartBot(reply);
});

// --- Command to list all filters ---
cmd({
    pattern: 'listfilters',
    alias: ['listf', 'filters', 'listfilter'],
    desc: 'List all private and group chat filters.',
    category: 'owner',
    filename: __filename
}, async (sock, m, message, { reply }) => {
    let list = '📋 *Filters List:*\n\n';
    let pCount = 0;
    for (let trigger in pfilter) {
        list += `*Private:* ➤ *${trigger}* → _${pfilter[trigger]}_\n`;
        pCount++;
    }
    let gCount = 0;
    for (let trigger in gfilter) {
        list += `*Group:* ➤ *${trigger}* → _${gfilter[trigger]}_\n`;
        gCount++;
    }
    if (pCount === 0 && gCount === 0) {
        list = '❌ No filters found.';
    }
    reply(list);
});

// --- Command to delete a private filter ---
cmd({
    pattern: 'pstop',
    alias: ['delpfilter', 'delpf'],
    desc: 'Delete a private chat filter.',
    category: 'owner',
    filename: __filename,
    use: '<trigger>'
}, async (sock, m, message, { args, reply, isPatron, isGroup }) => {
    if (!isPatron) return reply('*📛 This command is restricted to owners only.*');
    if (isGroup) return reply('❌ This command is for private chat only.');
    if (!args[0]) return reply('Example: .delpfilter hi');
    
    const trigger = args.join(' ').toLowerCase();
    if (!pfilter[trigger]) return reply(`❌ Filter not found for the word *${trigger}*.`);
    
    delete pfilter[trigger];
    savePFilter();
    await reply(`✅ Deleted private filter for *${trigger}*`);
    restartBot(reply);
});

// --- Command to delete a group filter ---
cmd({
    pattern: 'gstop',
    alias: ['delgfilter', 'delgf'],
    desc: 'Delete a group chat filter.',
    category: 'owner',
    filename: __filename,
    use: '<trigger>'
}, async (sock, m, message, { args, reply, isPatron, isGroup }) => {
    if (!isPatron) return reply('*📛 This command is restricted to owners only.*');
    if (!isGroup) return reply('❌ This command is for group chats only.');
    if (!args[0]) return reply('Example: .delgfilter welcome');

    const trigger = args.join(' ').toLowerCase();
    if (!gfilter[trigger]) return reply(`❌ Filter not found for the word *${trigger}*.`);

    delete gfilter[trigger];
    saveGFilter();
    await reply(`✅ Deleted group filter for *${trigger}*`);
    restartBot(reply);
});
