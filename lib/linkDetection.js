// linkDetection.js

const fs = require('fs');
const path = require('path');

// Create a 'database' directory if it doesn't exist
const databaseDir = path.join(__dirname, 'database');
if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, {
        recursive: true
    });
}

const linkDetectionFile = path.join(databaseDir, 'linkDetection.json');

/**
 * Ensures that the linkDetection.json file exists. Creates it if it doesn't.
 * @returns {{success: boolean, message?: string}} An object indicating success or failure.
 */
const ensureLinkDetectionFile = () => {
    try {
        if (!fs.existsSync(linkDetectionFile)) {
            fs.writeFileSync(linkDetectionFile, JSON.stringify({}));
            return {
                success: true,
                message: 'Created new linkDetection.json file'
            };
        }
        return {
            success: true
        };
    } catch (error) {
        return {
            success: false,
            message: `Error creating linkDetection.json: ${error.message}`
        };
    }
};

/**
 * Reads all link detection settings from the JSON file.
 * @returns {{success: boolean, settings: object}} The settings object.
 * @throws {Error} If reading or parsing the file fails.
 */
const getLinkDetectionSettings = () => {
    const result = ensureLinkDetectionFile();
    if (!result.success) {
        throw new Error(result.message);
    }

    try {
        const fileContent = fs.readFileSync(linkDetectionFile, 'utf-8');
        const settings = JSON.parse(fileContent);
        return {
            success: true,
            settings
        };
    } catch (error) {
        throw new Error(`Error reading linkDetection.json: ${error.message}`);
    }
};

/**
 * Enables link detection for a specific group with a given mode.
 * @param {string} groupId - The ID of the group.
 * @param {string} mode - The mode to set (e.g., 'warn', 'kick').
 * @returns {{success: boolean, message: string}} An object indicating success.
 * @throws {Error} If enabling fails.
 */
const enableLinkDetection = (groupId, mode) => {
    try {
        const {
            settings
        } = getLinkDetectionSettings();
        settings[groupId] = mode;
        fs.writeFileSync(linkDetectionFile, JSON.stringify(settings, null, 2));
        return {
            success: true,
            message: `Enabled ${mode} mode for group ${groupId}`
        };
    } catch (error) {
        throw new Error(`Error enabling link detection: ${error.message}`);
    }
};

/**
 * Disables link detection for a specific group.
 * @param {string} groupId - The ID of the group.
 * @returns {{success: boolean, message: string}} An object indicating success.
 * @throws {Error} If disabling fails.
 */
const disableLinkDetection = (groupId) => {
    try {
        const {
            settings
        } = getLinkDetectionSettings();
        delete settings[groupId];
        fs.writeFileSync(linkDetectionFile, JSON.stringify(settings, null, 2));
        return {
            success: true,
            message: `Disabled link detection for group ${groupId}`
        };
    } catch (error) {
        throw new Error(`Error disabling link detection: ${error.message}`);
    }
};

/**
 * Gets the current link detection mode for a specific group.
 * @param {string} groupId - The ID of the group.
 * @returns {{success: boolean, mode: string|null}} The current mode or null if not set.
 * @throws {Error} If getting the mode fails.
 */
const getLinkDetectionMode = (groupId) => {
    try {
        const {
            settings
        } = getLinkDetectionSettings();
        const mode = settings[groupId] || null;
        return {
            success: true,
            mode
        };
    } catch (error) {
        throw new Error(`Error getting mode: ${error.message}`);
    }
};

module.exports = {
    enableLinkDetection,
    disableLinkDetection,
    getLinkDetectionMode
};
