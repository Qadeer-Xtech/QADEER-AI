// groupMessagesStorage.js

const fs = require('fs');
const path = require('path');

const storageFile = path.resolve(__dirname, 'groupMessagesSettings.json');

// If the settings file doesn't exist, create it with a default structure.
if (!fs.existsSync(storageFile)) {
    fs.writeFileSync(
        storageFile,
        JSON.stringify({
            welcome: {},
            goodbye: {}
        }, null, 2),
        'utf8'
    );
}

/**
 * Loads the welcome/goodbye message settings from the JSON file.
 * @returns {object} The settings object, or a default object on error.
 */
function loadSettings() {
    try {
        const data = fs.readFileSync(storageFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading groupMessages settings:', error);
        // Return a default structure if reading fails
        return {
            welcome: {},
            goodbye: {}
        };
    }
}

/**
 * Saves the provided settings object to the JSON file.
 * @param {object} settings - The settings object to save.
 */
function saveSettings(settings) {
    try {
        fs.writeFileSync(storageFile, JSON.stringify(settings, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing groupMessages settings:', error);
    }
}

module.exports = {
    loadSettings,
    saveSettings
};
