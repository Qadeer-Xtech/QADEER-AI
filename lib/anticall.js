const { getAntiCall, addWarn, resetWarns } = require('../data/anticall');

module.exports = async function antiCallHandler(conn, call) {
    try {
        const status = await getAntiCall();
        if (!status) return; // Feature off

        const caller = call.from;
        const warns = await addWarn(caller);

        if (warns < 3) {
            await conn.sendMessage(caller, { text: `🚫 Call rejected automatically! Please don't call without permission⚠️\nWarn: ${warns}/3` });
            await conn.rejectCall(call.id, caller);
        } else {
            await conn.sendMessage(caller, { text: "🚫 Last warning reached. You are now blocked for 10 minutes." });
            await conn.rejectCall(call.id, caller);
            await conn.updateBlockStatus(caller, "block");

            setTimeout(async () => {
                await conn.updateBlockStatus(caller, "unblock");
                await resetWarns(caller);
                await conn.sendMessage(caller, { text: "✅ You have been unblocked. Please don't call again." });
            }, 10 * 60 * 1000); // 10 minutes
        }
    } catch (e) {
        console.error("Error in anti-call handler:", e);
    }
};