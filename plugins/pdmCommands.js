const fs = require('fs');
const { cmd } = require('../command');
const pdmDatabasePath = './lib/pdmsettings.json';

// Function to get the PDM status for a group
const getPDMStatus = (chatId) => {
    try {
        const settings = JSON.parse(fs.readFileSync(pdmDatabasePath, 'utf8'));
        return settings[chatId] || false;
    } catch (error) {
        console.error('Error reading PDM settings:', error);
        return false;
    }
};

// Function to update the PDM status for a group
const updatePDMStatus = (chatId, status) => {
    try {
        let settings = {};
        if (fs.existsSync(pdmDatabasePath)) {
            settings = JSON.parse(fs.readFileSync(pdmDatabasePath, 'utf8'));
        }
        settings[chatId] = status;
        fs.writeFileSync(pdmDatabasePath, JSON.stringify(settings, null, 2), 'utf8');
    } catch (error) {
        console.error('Error updating PDM settings:', error);
    }
};

cmd({
    pattern: 'pdm',
    desc: 'Enable or Disable promotion/demotion announcement for a group',
    category: 'group',
    use: '[on/off]',
    filename: __filename
}, async (bot, message, context, { from, reply, isAdmin, isPatron, isGroup, args }) => {
    try {
        if (!isGroup) {
            return reply('❌ This command can only be used in groups!');
        }
        if (!isAdmin && !isPatron) {
            return reply('❌ You must be an admin to use this command!');
        }

        const option = args[0]?.toLowerCase();

        if (!['on', 'off'].includes(option)) {
            return reply('❌ Please use .pdm on or .pdm off to toggle the feature.');
        }

        if (option === 'on') {
            updatePDMStatus(from, true);
            await bot.sendMessage(from, { text: '✅ *PDM is now enabled* for this group. Admin promotions and demotions will be notified.' });
        } else if (option === 'off') {
            updatePDMStatus(from, false);
            await bot.sendMessage(from, { text: '✅ *PDM is now disabled* for this group. Admin promotions and demotions will no longer be notified.' });
        }
    } catch (error) {
        console.error('PDM command error:', error);
        reply('❌ An error occurred while processing your request.');
    }
});

module.exports = { getPDMStatus, updatePDMStatus };
