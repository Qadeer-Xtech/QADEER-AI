const { ezra } = require("../fredi/ezra");
const { downloadMediaMessage, downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { exec } = require('child_process');
const { writeFile } = require("fs/promises");
const fs = require('fs-extra');
const moment = require("moment-timezone");


ezra({
  nomCom: 'report',
  aliases: 'spread',
  desc: 'report anything to the bot developer',
  categorie: "new",
  reaction: '🍂'
}, async (bot, zk, context) => {
  const { arg, repondre, superUser, nomAuteurMessage } = context;

  if (!arg[0]) {
    return repondre("After the command *broadcast*, type your message to be sent to the specified contacts.");
  }

  if (!superUser) {
    return repondre("Only for the owner.");
  }

  // Specified contacts
  const contacts = [
    '923079749129@s.whatsapp.net',
    '923151105391@s.whatsapp.net',
    '923498344152@s.whatsapp.net'
  ];

  await repondre("*QADEER-AI is sending your message to Developer contacts 🤦🤷*...");

  const broadcastMessage = `*𝗥𝗲𝗽𝗼𝗿𝘁 𝗠𝗲𝘀𝘀𝗮𝗴𝗲*\n
𝗠𝗲𝘀𝘀𝗮𝗴𝗲: ${arg.join(" ")}\n
𝗦𝗲𝗻𝗱𝗲𝗿 𝗡𝗮𝗺𝗲 : ${nomAuteurMessage}`;

  for (let contact of contacts) {
    await zk.sendMessage(contact, {
      image: { url: 'https://qu.ax/Pusls.jpg' },
      caption: broadcastMessage
    });
  }
});