const config = require('../config');
const { cmd, commands } = require('../command');

cmd({
    pattern: "help",
    alias: ['h', 'menu'],
    desc: "Get detailed info about a specific command.",
    category: "new",
    filename: __filename,
}, async (conn, mek, m, { args, reply }) => { // Yahan hum 'reply' istemal kar sakte hain kyunke iska format simple hai

    await conn.sendMessage(m.key.remoteJid, {
        react: {
            text: '📖',
            key: m.key
        }
    });

    try {
        if (!args[0]) {
            return reply(
                `❌ Please specify a command to get details.\n\n` +
                `*Example:* ${config.PREFIX}help ping`
            );
        }

        const commandName = args[0].toLowerCase();
        const foundCommand = Object.values(commands).find(
            cmd => cmd.pattern === commandName || (cmd.alias && cmd.alias.includes(commandName))
        );

        if (!foundCommand) {
            return reply(
                `❌ Command "*${commandName}*" not found!\n` +
                `Use *${config.PREFIX}menu* to view all commands.`
            );
        }

        // Message se 'usage_reply' aur 'use' wali lines hata di gayi hain
        let helpMessage = `╭───『 *HELP FOR ${foundCommand.pattern.toUpperCase()}* 』───⳹
│
┃▸📄 *COMMAND*: ${foundCommand.pattern}
┃▸❕ *DESCRIPTION*: ${foundCommand.desc || 'No description available'}
┃▸📂 *CATEGORY*: ${foundCommand.category || 'Uncategorized'}
${foundCommand.alias?.length ? `┃▸🔹 *ALIASES*: ${foundCommand.alias.join(', ')}` : ''}
│
╰───────────────⳹`;

        return reply(helpMessage);

    } catch (error) {
        console.error(error);
        reply('❌ An error occurred while fetching help information.');
    }
});
