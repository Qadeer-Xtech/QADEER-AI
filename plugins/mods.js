
const { ezra } = require('../fredi/ezra');
const axios = require('axios');
const { Sticker, createSticker, StickerTypes } = require('wa-sticker-formatter');

// --- DATABASE & UTILITY FUNCTIONS ---
const { isUserBanned, addUserToBanList, removeUserFromBanList } = require('../lib/banUser');
const { addGroupToBanList, isGroupBanned, removeGroupFromBanList } = require('../lib/banGroup');
const { isGroupOnlyAdmin, addGroupToOnlyAdminList, removeGroupFromOnlyAdminList } = require('../lib/onlyAdmin');
const { removeSudoNumber, addSudoNumber, issudo } = require('../lib/sudo');

// A simple asynchronous sleep function
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};


//================================================================================
// --- COMMAND: TGS (TELEGRAM STICKER DOWNLOADER) ---
//================================================================================
ezra({
    nomCom: 'tgs',
    categorie: 'Mods'
}, async (jid, zoro, options) => {
    const { ms, repondre, arg, nomAuteurMessage, superUser } = options;

    if (!superUser) {
        return repondre("Only mods can use this command");
    }
    if (!arg[0]) {
        return repondre("Please put a Telegram sticker link.");
    }

    let query = arg.join(' ');
    let packName = query.split('https://t.me/addstickers/')[1];
    let telegramApiUrl = `https://api.telegram.org/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/getStickerSet?name=${encodeURIComponent(packName)}`;

    try {
        let response = await axios.get(telegramApiUrl);
        let stickerType = response.data.result.is_animated || response.data.result.is_video ? "animated sticker" : "not animated sticker";
        
        let initialMessage = `   Zk-stickers-dl\n\n  *Name :* ${response.data.result.name}\n  *Type :* ${stickerType}\n  *Length :* ${response.data.result.stickers.length}\n\n       Downloading...`;
        await repondre(initialMessage);

        for (let i = 0; i < response.data.result.stickers.length; i++) {
            let fileIdResponse = await axios.get(`https://api.telegram.org/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/getFile?file_id=${response.data.result.stickers[i].file_id}`);
            
            let fileDownloadUrl = `https://api.telegram.org/file/bot891038791:AAHWB1dQd-vi0IbH2NjKYUk-hqQ8rQuzPD4/${fileIdResponse.data.result.file_path}`;
            
            let stickerData = await axios({
                method: 'get',
                url: fileDownloadUrl,
                responseType: 'arraybuffer'
            });

            const sticker = new Sticker(stickerData.data, {
                pack: nomAuteurMessage,
                author: 'hans-md',
                type: StickerTypes.FULL,
                categories: ['🤩', '🎉'],
                id: '12345',
                quality: 50,
                background: '#000000'
            });

            const stickerBuffer = await sticker.toBuffer();
            await zoro.sendMessage(jid, { sticker: stickerBuffer }, { quoted: ms });
        }
    } catch (error) {
        repondre("We got an error \n", error);
    }
});


//================================================================================
// --- COMMAND: CREW (CREATE GROUP) ---
//================================================================================
ezra({
    nomCom: 'crew',
    categorie: 'Mods'
}, async (jid, zoro, options) => {
    const { ms, repondre, arg, auteurMessage, superUser, auteurMsgRepondu, msgRepondu } = options;

    if (!superUser) {
        return repondre("only mods can use this command");
    }
    if (!arg[0]) {
        return repondre("Please enter the name of the group to create");
    }
    if (!msgRepondu) {
        return repondre("Please mention a member to be added.");
    }

    const groupName = arg.join(' ');
    const newGroup = await zoro.groupCreate(groupName, [auteurMessage, auteurMsgRepondu]);
    
    console.log(`created group with id: ${newGroup.id}`);
    zoro.sendMessage(newGroup.id, { text: 'Welcome to ' + groupName });
});


//================================================================================
// --- COMMAND: LEFT (LEAVE GROUP) ---
//================================================================================
ezra({
    nomCom: 'left',
    categorie: 'Mods'
}, async (jid, zoro, options) => {
    const { ms, repondre, verifGroupe, superUser } = options;

    if (!verifGroupe) {
        return repondre("Group only");
    }
    if (!superUser) {
        return repondre("Order reserved for the owner");
    }
    await zoro.groupLeave(jid);
});


//================================================================================
// --- COMMAND: JOIN (JOIN GROUP VIA LINK) ---
//================================================================================
ezra({
    nomCom: 'join',
    categorie: 'Mods'
}, async (jid, zoro, options) => {
    const { arg, ms, repondre, superUser } = options;

    if (!superUser) {
        return repondre("command reserved for the bot owner");
    }
    let inviteCode = arg[0].split('https://chat.whatsapp.com/')[1];
    await zoro.groupAcceptInvite(inviteCode);
    repondre('Success').catch(e => repondre("we got an error \n"));
});


//================================================================================
// --- COMMAND: JID (GET WHATSAPP ID) ---
//================================================================================
ezra({
    nomCom: 'jid',
    categorie: 'Mods'
}, async (jid, zoro, options) => {
    const { repondre, superUser, msgRepondu, auteurMsgRepondu } = options;

    if (!superUser) {
        return repondre("command reserved for the bot owner");
    }
    
    let targetJid = !msgRepondu ? jid : auteurMsgRepondu;
    repondre(targetJid);
});


//================================================================================
// --- COMMANDS: BLOCK & UNBLOCK ---
//================================================================================
ezra({
    nomCom: 'block',
    categorie: 'Mods'
}, async (jid, zoro, options) => {
    const { repondre, superUser, msgRepondu, auteurMsgRepondu } = options;

    if (!superUser) {
        return repondre("command reserved for the bot owner");
    }
    let targetJid = msgRepondu ? auteurMsgRepondu : jid;
    await zoro.updateBlockStatus(targetJid, 'block');
    repondre('Success');
});

ezra({
    nomCom: 'unblock',
    categorie: 'Mods'
}, async (jid, zoro, options) => {
    const { repondre, superUser, msgRepondu, auteurMsgRepondu } = options;

    if (!superUser) {
        return repondre("command reserved for the bot owner");
    }
    let targetJid = msgRepondu ? auteurMsgRepondu : jid;
    await zoro.updateBlockStatus(targetJid, 'unblock');
    repondre('Success');
});


//================================================================================
// --- COMMAND: KICKALL (REMOVE ALL NON-ADMINS) ---
//================================================================================
ezra({
    nomCom: 'kickall',
    categorie: 'Group',
    reaction: '📣'
}, async (jid, zoro, options) => {
    const { auteurMessage, repondre, verifGroupe, infosGroupe, superUser } = options;
    const groupMetadata = await zoro.groupMetadata(jid);

    if (!verifGroupe) {
        return repondre("✋🏿 ✋🏿this command is reserved for groups ❌");
    }
    if (superUser || auteurMessage == groupMetadata.owner) {
        repondre("No_admin members will be removed from the group. You have 5 seconds to reclaim your choice by restarting the bot.");
        await sleep(5000);
        
        try {
            let participants = infosGroupe.participants;
            let nonAdmins = participants.filter(p => !p.admin);
            for (const member of nonAdmins) {
                await zoro.groupParticipantsUpdate(jid, [member.id], 'remove');
                await sleep(500);
            }
        } catch (error) {
            repondre("I need administration rights");
        }
    } else {
        return repondre("Order reserved for the group owner for security reasons");
    }
});


//================================================================================
// --- COMMANDS: BAN & UNBAN (USERS & GROUPS) ---
//================================================================================
ezra({
    nomCom: 'ban',
    categorie: 'Mods'
}, async (jid, zoro, options) => {
    const { arg, auteurMsgRepondu, msgRepondu, repondre, superUser } = options;

    if (!superUser) {
        return repondre("This command is only allowed to the bot owner");
    }
    if (!arg[0]) {
        return repondre("Usage: ban add/del");
    }
    if (!msgRepondu) {
        return repondre("mention the victim");
    }

    switch (arg.join(' ')) {
        case 'add':
            let isBanned = await isUserBanned(auteurMsgRepondu);
            if (isBanned) {
                return repondre("This user is already banned");
            }
            addUserToBanList(auteurMsgRepondu);
            repondre("Success");
            break;
        case 'del':
            let isBannedCheck = await isUserBanned(auteurMsgRepondu);
            if (isBannedCheck) {
                removeUserFromBanList(auteurMsgRepondu);
                repondre("This user is now free.");
            } else {
                repondre("This user is not banned.");
            }
            break;
        default:
            repondre("bad option");
            break;
    }
});

ezra({
    nomCom: 'bangroup',
    categorie: 'Mods'
}, async (jid, zoro, options) => {
    const { arg, repondre, superUser, verifGroupe } = options;
    if (!superUser) {
        return repondre("This command is only allowed to the bot owner");
    }
    if (!verifGroupe) {
        return repondre("command reserved for groups");
    }
    if (!arg[0]) {
        return repondre("Usage: bangroup add/del");
    }

    const isBanned = await isGroupBanned(jid);
    switch (arg.join(' ')) {
        case 'add':
            if (isBanned) {
                return repondre("This group is already banned");
            }
            addGroupToBanList(jid);
            repondre("Success");
            break;
        case 'del':
            if (isBanned) {
                removeGroupFromBanList(jid);
                repondre("This group is now free.");
            } else {
                repondre("This group is not banned.");
            }
            break;
        default:
            repondre("bad option");
            break;
    }
});


//================================================================================
// --- COMMAND: ONLYADMIN (TOGGLE ADMIN-ONLY CHAT MODE FOR BOT) ---
//================================================================================
ezra({
    nomCom: 'onlyadmin',
    categorie: 'Group'
}, async (jid, zoro, options) => {
    const { arg, repondre, superUser, verifGroupe, verifAdmin } = options;
    
    if (superUser || verifAdmin) {
        if (!verifGroupe) {
            return repondre("command reserved for groups");
        }
        if (!arg[0]) {
            return repondre("Usage: onlyadmin add/del");
        }

        const isInOnlyAdminMode = await isGroupOnlyAdmin(jid);
        switch (arg.join(' ')) {
            case 'add':
                if (isInOnlyAdminMode) {
                    return repondre("This group is already in onlyadmin mode");
                }
                addGroupToOnlyAdminList(jid);
                repondre("Success");
                break;
            case 'del':
                if (isInOnlyAdminMode) {
                    removeGroupFromOnlyAdminList(jid);
                    repondre("This group is now free.");
                } else {
                    repondre("This group is not in onlyadmin mode.");
                }
                break;
            default:
                repondre("bad option");
                break;
        }
    } else {
        repondre("You are not entitled to this order");
    }
});


//================================================================================
// --- COMMAND: SUDO (MANAGE MODERATORS) ---
//================================================================================
ezra({
    nomCom: 'sudo',
    categorie: 'Mods'
}, async (jid, zoro, options) => {
    const { arg, auteurMsgRepondu, msgRepondu, repondre, superUser } = options;

    if (!superUser) {
        return repondre("This command is only allowed to the bot owner");
    }
    if (!arg[0]) {
        return repondre("Usage: sudo add/del");
    }
    if (!msgRepondu) {
        return repondre("mention the victim");
    }

    switch (arg.join(' ')) {
        case 'add':
            let isAlreadySudo = await issudo(auteurMsgRepondu);
            if (isAlreadySudo) {
                return repondre("This user is already sudo");
            }
            addSudoNumber(auteurMsgRepondu);
            repondre('Success');
            break;
        case 'del':
            let isSudoCheck = await issudo(auteurMsgRepondu);
            if (isSudoCheck) {
                removeSudoNumber(auteurMsgRepondu);
                repondre("This user is now non-sudo.");
            } else {
                repondre("This user is not sudo.");
            }
            break;
        default:
            repondre("bad option");
            break;
    }
});


//================================================================================
// --- COMMAND: SAVE (SAVE/FORWARD A MESSAGE TO OWNER) ---
//================================================================================
ezra({
    nomCom: 'save',
    categorie: 'Mods'
}, async (jid, zoro, options) => {
    const { repondre, msgRepondu, superUser, auteurMessage } = options;
    
    if (!superUser) {
        return repondre("only mods can use this command");
    }
    if (!msgRepondu) {
        return repondre("Mention the message that you want to save");
    }

    let messageToSend;
    if (msgRepondu.imageMessage) {
        let mediaUrl = await zoro.downloadAndSaveMediaMessage(msgRepondu.imageMessage);
        messageToSend = { image: { url: mediaUrl }, caption: msgRepondu.imageMessage.caption };
    } else if (msgRepondu.videoMessage) {
        let mediaUrl = await zoro.downloadAndSaveMediaMessage(msgRepondu.videoMessage);
        messageToSend = { video: { url: mediaUrl }, caption: msgRepondu.videoMessage.caption };
    } else if (msgRepondu.audioMessage) {
        let mediaUrl = await zoro.downloadAndSaveMediaMessage(msgRepondu.audioMessage);
        messageToSend = { audio: { url: mediaUrl }, mimetype: 'audio/mp4' };
    } else if (msgRepondu.stickerMessage) {
        let mediaData = await zoro.downloadAndSaveMediaMessage(msgRepondu.stickerMessage);
        const sticker = new Sticker(mediaData, {
            pack: 'joel md-tag',
            type: StickerTypes.CROPPED,
            id: '12345',
            quality: 70,
            background: 'transparent'
        });
        const stickerBuffer = await sticker.toBuffer();
        messageToSend = { sticker: stickerBuffer };
    } else {
        messageToSend = { text: msgRepondu.conversation };
    }
    
    zoro.sendMessage(auteurMessage, messageToSend);
});
