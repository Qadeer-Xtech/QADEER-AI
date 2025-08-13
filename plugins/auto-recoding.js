const fs = require('fs');
const path = require('path');
const config = require('../config')
const {cmd , commands} = require('../command')


//auto recording
cmd({
  pattern: 'autorecording_event', // <<< YEH LINE ADD KI GAYI HAI
  on: "body",
  fromMe: false,                  // <<< YEH LINE BEHTARI KE LIYE HAI
  dontAddCommandList: true        // <<< YEH LINE ADD KI GAYI HAI
},    
async (conn, mek, m, { from, body, isOwner, isSudo }) => {       
 if (config.AUTO_RECORDING === 'true') {
                await conn.sendPresenceUpdate('recording', from);
            }
         } 
   );
