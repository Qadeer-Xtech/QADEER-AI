// Is file ka kaam sirf alive message ka text generate karna hai
function getAliveMessage(ownerName, botName, uptime) {
    const message = `
╭━═「 *${botName}* 」═━❂
┃⊛╭────••••────➻
┃⊛│ Hey, I'm alive!
┃⊛│
┃⊛│◆ Owner: ${ownerName}
┃⊛│◆ Uptime: ${uptime}
┃⊛│◆ Bot Name: ${botName}
┃⊛│
┃⊛│ Desc: A powerful WhatsApp bot created by Qadeer Khan.
┃⊛└────••••────➻
╰─━━━━══──══━━━❂

> *I'm not just code, I'm an experience.*
`;
    return message;
}

module.exports = { getAliveMessage };
