const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    on: 'body'
}, async (sock, m, store, { from, body, isOwner }) => {
    // If AUTO_TYPING is set to 'true' in config, show "composing" status
    if (config.AUTO_TYPING === 'true') {
        await sock.sendPresenceUpdate('composing', from);
    }
});
