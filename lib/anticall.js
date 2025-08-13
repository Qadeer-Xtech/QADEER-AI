const { getAntiCallStatus, getCallRecord, incrementCallCount, resetCallCount, setBlockStatus } = require('../data/anticall');
const { getRandomMessage, blockMessage, unblockMessage } = require('./anticall_messages');

const MAX_CALLS = 3;
const BLOCK_DURATION_MINUTES = 10;

const handleCall = async (sock, call) => {
    const isAntiCallEnabled = await getAntiCallStatus();
    if (!isAntiCallEnabled) return;

    const callerJid = call.from;
    const callId = call.id;

    // Reject the call immediately
    await sock.rejectCall(callId, callerJid);

    const userRecord = await getCallRecord(callerJid);

    // If user is already blocked, do nothing
    if (userRecord.is_blocked) {
        console.log(`Ignoring call from already blocked user: ${callerJid}`);
        return;
    }

    await incrementCallCount(callerJid);
    const newCallCount = userRecord.call_count + 1;
    
    // Send a random rejection message
    await sock.sendMessage(callerJid, { text: getRandomMessage() });

    if (newCallCount >= MAX_CALLS) {
        // Block the user
        await sock.updateBlocklist(callerJid, 'block');
        await setBlockStatus(callerJid, true);
        await sock.sendMessage(callerJid, { text: blockMessage });
        console.log(`Blocked ${callerJid} for ${BLOCK_DURATION_MINUTES} minutes after ${newCallCount} calls.`);

        // Schedule unblock
        setTimeout(async () => {
            await sock.updateBlocklist(callerJid, 'unblock');
            await setBlockStatus(callerJid, false);
            await resetCallCount(callerJid);
            await sock.sendMessage(callerJid, { text: unblockMessage });
            console.log(`Unblocked ${callerJid}.`);
        }, BLOCK_DURATION_MINUTES * 60 * 1000);
    }
};

module.exports = {
    handleCall
};