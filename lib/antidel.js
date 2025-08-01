const {
    getDevice
} = require("../lib/functions.js");
const {
    loadMessage,
    isAntiDeleteEnabled
} = require("../lib/database.js");
const config = require("../config.js");

const sendForwardedMessage = async (sock, message, from, text, isGroup, originalMessage) => {
    const senderName = message.pushName ? ? (message.verifiedBizName ? ? "Unknown");
    text += `\n*From:* @${senderName}`;

    await sock.sendMessage(from, {
        text: text,
        contextInfo: {
            mentionedJid: isGroup ? [originalMessage.key.participant, message.key.participant] : [originalMessage.key.participant],
            expiration: 999,
            isForwarded: true,
            forwardingScore: { 
                "storage": "HIGH",
                "isRecent": "HIGH"
            }
        }
    }, {
        quoted: message
    });
};

const sendQuotedMessage = async (sock, message, from, text) => {
    const quotedMessage = structuredClone(message.message);
    const messageType = Object.keys(quotedMessage)[0];

    if (quotedMessage[messageType]) {
        quotedMessage[messageType].contextInfo = {
            participant: message.key.participant,
            remoteJid: message.remoteJid,
            quotedMessage: message.message,
            expiration: 999,
            isForwarded: true,
            forwardingScore: {
                "storage": "HIGH",
                "isRecent": "HIGH"
            }
        };
    }

    if (messageType === "conversation" || messageType === "extendedTextMessage") {
        quotedMessage[messageType].text = text;
    } else if (messageType === "imageMessage" || messageType === "videoMessage") {
        await sock.sendMessage(from, {
            text: `*ANTIDELETE*\n${text}`,
            contextInfo: {
                expiration: 999,
                isForwarded: true,
                forwardingScore: {
                    "storage": "HIGH",
                    "isRecent": "HIGH"
                }
            }
        }, {
            quoted: message
        });
        return;
    }

    await sock.sendMessage(from, quotedMessage, {});
};

const handleAntiDelete = async (sock, messages) => {
    for (const message of messages) {
        if (message.update.message === null) {
            const originalMessage = await loadMessage(message.key.id);

            if (originalMessage && originalMessage.message) {
                const isGroup = originalMessage.key.remoteJid.endsWith("@g.us");
                const antiDeleteEnabled = await isAntiDeleteEnabled();

                if (!antiDeleteEnabled) continue;

                const deletionTime = new Date().toLocaleString("en-US", {
                    timeZone: "Asia/Karachi",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric"
                });

                let notificationText, destination;
                

                if (isGroup) {
                    const deviceType = await getDevice(originalMessage.key.id);
                    // Neeche "? ." ke darmiyan se space hata di gayi hai
                    const deletedBy = message.key.participant?.split("@")[0];
                    const originalSender = originalMessage.key.participant?.split("@")[0];

                    notificationText = `*DELETED MSG*\n*User:* @${originalSender}\n*Device:* ${deviceType}\n*Time:* ${deletionTime}\n`;
                    destination = config.LOG_DELETE === "true" ? sock.user.id : originalMessage.key.remoteJid;
                } else {
                    const originalSender = originalMessage.key.participant?.split("@")[0];
                    const deletedBy = message.key.participant?.split("@")[0];

                    notificationText = `*DELETED MSG*\n*User:* @${originalSender}\n*Time:* ${deletionTime}\n`;
                    destination = config.LOG_DELETE === "true" ? sock.user.id : message.key.remoteJid;
                }

                if (originalMessage.message?.conversation || originalMessage.message?.extendedTextMessage) {
                    await sendQuotedMessage(sock, originalMessage, destination, notificationText);
                } else {
                    await sendForwardedMessage(sock, originalMessage, destination, notificationText, isGroup, message);
                }
            }
        }
    }
};

module.exports = {
    sendForwardedMessage: sendForwardedMessage,
    sendQuotedMessage: sendQuotedMessage,
    handleAntiDelete: handleAntiDelete,
};
