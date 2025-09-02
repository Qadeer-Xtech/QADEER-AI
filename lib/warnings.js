// warnings.js

const fs = require('fs');
const path = require('path');

// Ensure a 'database' directory exists for storing data files
const databaseDir = path.join(__dirname, 'database');
if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir, {
        recursive: true
    });
}

const warningsFile = path.join(databaseDir, 'warnings.json');

/**
 * Ensures the warnings.json file exists, creating it if necessary.
 * @returns {{success: boolean, message?: string}} Status object.
 */
const ensureWarningsFile = () => {
    try {
        if (!fs.existsSync(warningsFile)) {
            fs.writeFileSync(warningsFile, JSON.stringify({}));
            return {
                success: true,
                message: 'Created new warnings.json file'
            };
        }
        return {
            success: true
        };
    } catch (error) {
        return {
            success: false,
            message: `Error creating warnings.json: ${error.message}`
        };
    }
};

/**
 * Gets the current warning count for a specific user in a group.
 * @param {string} groupId - The ID of the group.
 * @param {string} userId - The ID of the user.
 * @returns {number} The current warning count, defaults to 0.
 * @throws {Error} If reading the warnings file fails.
 */
const getWarnings = (groupId, userId) => {
    const fileCheck = ensureWarningsFile();
    if (!fileCheck.success) {
        throw new Error(fileCheck.message);
    }
    try {
        const fileContent = fs.readFileSync(warningsFile, 'utf-8');
        const warnings = JSON.parse(fileContent);
        return warnings[groupId]?.[userId] || 0;
    } catch (error) {
        throw new Error(`Error reading warnings: ${error.message}`);
    }
};

/**
 * Increments the warning count for a user in a group by one.
 * @param {string} groupId - The ID of the group.
 * @param {string} userId - The ID of the user.
 * @returns {number} The new warning count.
 * @throws {Error} If adding the warning fails.
 */
const addWarning = (groupId, userId) => {
    const fileCheck = ensureWarningsFile();
    if (!fileCheck.success) {
        throw new Error(fileCheck.message);
    }
    try {
        const fileContent = fs.readFileSync(warningsFile, 'utf-8');
        const warnings = JSON.parse(fileContent);

        if (!warnings[groupId]) {
            warnings[groupId] = {};
        }
        warnings[groupId][userId] = (warnings[groupId][userId] || 0) + 1;

        fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));
        return warnings[groupId][userId];
    } catch (error) {
        throw new Error(`Error adding warning: ${error.message}`);
    }
};

/**
 * Resets the warning count for a user in a group to zero.
 * @param {string} groupId - The ID of the group.
 * @param {string} userId - The ID of the user.
 * @throws {Error} If resetting the warnings fails.
 */
const resetWarnings = (groupId, userId) => {
    const fileCheck = ensureWarningsFile();
    if (!fileCheck.success) {
        throw new Error(fileCheck.message);
    }
    try {
        const fileContent = fs.readFileSync(warningsFile, 'utf-8');
        const warnings = JSON.parse(fileContent);

        if (warnings[groupId] && warnings[groupId][userId]) {
            delete warnings[groupId][userId];
            fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));
        }
    } catch (error) {
        throw new Error(`Error resetting warnings: ${error.message}`);
    }
};

module.exports = {
    getWarnings,
    addWarning,
    resetWarnings
};
