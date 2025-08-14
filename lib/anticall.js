// lib/anticall.js (UPDATED WITH OLD BOT'S WORKING LOGIC)

const { getAntiCallStatus, getCallRecord, incrementCallCount, resetCallCount, setBlockStatus } = require('../data/anticall');
const { getRandomMessage, blockMessage, unblockMessage, whitelistMessage } = require('./anticall_messages');
const config = require('../config');

const MAX_CALLS = 3;
const BLOCK_DURATION_MINUTES = 10;

// This function now uses the logic from your old bot
const handleCall = async (sock, calls) => {
    const isAntiCallEnabled = await getAntiCallStatus();
    if (!isAntiCallEnabled) return;

    // Loop through all incoming call events, just like your old bot
    for (const call of calls) {
        
        // Use the working condition from your old bot: status === 'offer'
        if (call.status === 'offer') {
            const callerJid = call.from;
            const callId = call.id;

            console.log(`[Anti-Call] Incoming call offer from ${callerJid}. Rejecting.`);

            // Reject the call immediately
            await sock.rejectCall(callId, callerJid);

            // Now, apply all the advanced features of your new bot
            const whitelist = (config.WHITELIST_NUMBERS || "").split(',').map(num => num.trim());
            const callerNumber = callerJid.split('@')[0];

            if (whitelist.includes(callerNumber)) {
                console.log(`[Anti-Call] ${callerJid} is on the whitelist.`);
                await sock.sendMessage(callerJid, { text: whitelistMessage });
                continue; // Stop processing for this whitelisted user
            }

            const userRecord = await getCallRecord(callerJid);

            if (userRecord.is_blocked) {
                console.log(`[Anti-Call] Ignoring call from already blocked user: ${callerJid}`);
                continue;
            }

            await incrementCallCount(callerJid);
            const newCallCount = userRecord.call_count + 1;
            
            await sock.sendMessage(callerJid, { text: getRandomMessage() });

            if (newCallCount >= MAX_CALLS) {
                await sock.updateBlocklist(callerJid, 'block');
                await setBlockStatus(callerJid, true);
                await sock.sendMessage(callerJid, { text: blockMessage });
                console.log(`[Anti-Call] Blocked ${callerJid} for ${BLOCK_DURATION_MINUTES} minutes.`);

                setTimeout(async () => {
                    await sock.updateBlocklist(callerJid, 'unblock');
                    await setBlockStatus(callerJid, false);
                    await resetCallCount(callerJid);
                    await sock.sendMessage(callerJid, { text: unblockMessage });
                    console.log(`[Anti-Call] Unblocked ${callerJid}.`);
                }, BLOCK_DURATION_MINUTES * 60 * 1000);
            }
        }
    }
};

module.exports = {
    handleCall
};
