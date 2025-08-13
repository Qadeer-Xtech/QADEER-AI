const messages = [
    "Call rejected automatically! ⚠️ Please don't call without permission.",
    "Sorry, I am not available for calls. 🚫 Please leave a text message.",
    "Calls are not allowed for this bot. Your call has been rejected.",
    "Automated System: Call declined. 🤖 Text only.",
    "You are not authorized to call. Please contact the owner for permission.",
    "This is an automated response. Calls are disabled. 📵",
    "Call rejected. Repetitive calling may result in a temporary block."
];

const blockMessage = "You have been temporarily blocked for 10 minutes due to repeated calling. 🚫";
const unblockMessage = "You have been unblocked. Please avoid calling in the future. ✅";


// Function to get a random message from the list
function getRandomMessage() {
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}

module.exports = {
    getRandomMessage,
    blockMessage,
    unblockMessage
};