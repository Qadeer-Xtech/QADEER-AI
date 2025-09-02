const fs = require('fs');
const path = require('path');
const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    on: 'body'
}, async (sock, m, store, { from, body, isOwner }) => {
    // If AUTO_RECORDING is set to 'true' in config, show "recording" status
    if (config.AUTO_RECORDING === 'true') {
        await sock.sendPresenceUpdate('recording', from);
    }
});
