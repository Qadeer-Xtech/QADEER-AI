// data/fakechat_sessions.js

// This Set will store the JIDs of users who have fake chat mode enabled.
const activeSessions = new Set();

/**
 * Starts a fake chat session for a user.
 * @param {string} userJid The JID of the user.
 */
function startUserSession(userJid) {
    activeSessions.add(userJid);
}

/**
 * Stops a fake chat session for a user.
 * @param {string} userJid The JID of the user.
 */
function stopUserSession(userJid) {
    activeSessions.delete(userJid);
}

/**
 * Checks if a user is currently in a fake chat session.
 * @param {string} userJid The JID of the user.
 * @returns {boolean} True if the user is in a session, otherwise false.
 */
function isUserInSession(userJid) {
    return activeSessions.has(userJid);
}

module.exports = {
    startUserSession,
    stopUserSession,
    isUserInSession,
};
