// index.js

const {
    DeletedText,
    DeletedMedia,
    AntiDelete
} = require('./antidel');
const {
    DATABASE
} = require('./database');
const {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson
} = require('./functions');
const {
    sms,
    downloadMediaMessage
} = require('./msg');

// Export all imported functions and objects to be used throughout the application.
module.exports = {
    // from ./antidel
    DeletedText,
    DeletedMedia,
    AntiDelete,
    // from ./functions
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
    // from ./database
    DATABASE,
    // from ./msg
    sms,
    downloadMediaMessage
};
