const util = require('util');
const fs = require('fs-extra');
const os = require('os');
const moment = require('moment-timezone');
const { ezra } = require(__dirname + '/../fredi//ezra');
const { format, styletext } = require(__dirname + '/../fredi/mesfonctions');
const settings = require(__dirname + '/../set');

ezra({
    nomCom: 'deploy', 
    categorie: 'deploy' 
}, async (jid, zoro, options) => { 

    let { ms, repondre } = options;
    
    let { cm: commandMap } = require(__dirname + '/../fredi/ezra');

    var categorizedCommands = {};

    var botMode = 'public';
    if (settings.MODE_PUBLIC != 'oui') {
        botMode = 'private';
    }
  
    commandMap.map(async (command, index) => {
        if (!categorizedCommands[command.categorie]) {
            categorizedCommands[command.categorie] = [];
        }
        categorizedCommands[command.categorie].push(command.nomCom);
    });

    const currentDate = moment(moment()).format('DD/MM/YYYY');
    moment.tz.setDefault('Asia/Karachi');
    const currentTime = moment.tz('Asia/Karachi').format('HH:MM:SS');

    console.log('temps ' + currentTime);
    console.log('date' + currentDate);

    let replyMessage = `
 *DEPLOY YOUR OWN QADEER AI*

HELLO : ${ms.pushName}
*DEPLOY YOUR OWN QADEER AI 🤦 HERE*
YOUR DEPLOYER : ${settings.OWNER_NAME}
YOUR NAME : ${ms.pushName}
*TOTAL QADEER AI USERS : 1089+Users*
BOT DEOLOYED : 139+ apps deployed today
*TOP ON THE LINK TO GET SESSION*

https://tofan-session-3c389ebd74fb.herokuapp.com/


*STEPS TO GET SESSION ID*
*1.OPEN LINK ABOVE*
*2.INTER YOUR WHATSAPP NUMBER* *WITH*
*COUNTY CODE Eg. 92307xxx*
*3.QADEER WILL SEND YOU A CODE COPY* *THAT CODE. THEN WHATSAPP WILL* *SENT* *9230797xxx.*
*4.TOP ON THAT NOTIFICATION* *QADEER INTER* *THE CODE THAT QADEER AI SENT YOU*
*5.IT WILL LOAD FOR SOMETIME* *THEN QADEER AI* *WILL SEND YOU A SESSION ID IN* *YOUR* *INBOX IN WHATSAPP AT YOUR OWN* *NUMBER* *COPY THE SESSION ID AND SEND* *TO YOUR DEPLOYER* Note : bot aren't for free
   
   keep using QADEER AI

`;

    for (const category in categorizedCommands) {
        replyMessage += ''; 
        for (const command of categorizedCommands[category]) {
            replyMessage += '';
        }
    }

    // Define the URL for the image to be sent with the message
    var imageUrl = 'https://qu.ax/Pusls.jpg';

    // Try to send the message with the image, caption, and footer
    try {
        zoro.sendMessage(jid, {
            image: { url: imageUrl },
            caption: replyMessage,
            footer: '©TKM INC'
        }, { quoted: ms }); // 'quoted: ms' makes the bot reply to the user's original message
    } catch (error) {
        // If sending fails, log the error and notify the user
        console.log('🥵🥵 Menu erreur ' + error); // 'Menu erreur' is French for 'Menu error'
        repondre('🥵🥵 Menu erreur ' + error);
    }
});
