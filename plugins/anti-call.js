const { cmd } = require('../command');
const config = require('../config');

let isCallHandlerActive = false;

cmd({
    on: 'call'
}, async (sock, m, store, { from }) => {
    try {
        if (!isCallHandlerActive) {
            sock.ev.on('call', async (calls) => {
                // Check if ANTI_CALL is enabled in the config
                if (config.ANTI_CALL !== 'true') return;

                for (const call of calls) {
                    // We are only interested in incoming call offers
                    if (call.status !== 'offer') continue;
                    
                    // Reject the call
                    await sock.rejectCall(call.id, call.from);

                    // Send a message to the caller if it's not a group call
                    if (!call.isGroup) {
                        await sock.sendMessage(call.from, {
                            text: '> Call rejected automatically! Please do not call without permission⚠.My owner is busy right now so leave a text msg only😎',
                            mentions: [call.from]
                        });
                    }
                }
            });
            // Set the flag to true so the handler isn't attached again
            isCallHandlerActive = true;
        }
    } catch (error) {
        console.log(error);
        reply(error.toString());
    }
});
