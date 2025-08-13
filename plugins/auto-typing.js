const fs = require('fs');
const path = require('path');
const config = require('../config')
const {cmd , commands} = require('../command')


// Composing (Auto Typing)
cmd({
    pattern: 'autotyping_event', // <<< YEH LINE ADD KI GAYI HAI
    on: "body",
    fromMe: false,               // <<< YEH LINE BEHTARI KE LIYE HAI
    dontAddCommandList: true     // <<< YEH LINE ADD KI GAYI HAI
},    
async (conn, mek, m, { from, body, isOwner }) => {
    if (config.AUTO_TYPING === 'true') {
        await conn.sendPresenceUpdate('composing', from); // send typing 
    }
});
