const config = require("../config");
const { cmd, commands } = require("../command");
const { runtime } = require("../lib/functions");

// Command configuration
const commandInfo = {
    pattern: "help",
    alias: ["h", "menuhelp"],
    desc: "Get detailed info about a specific command",
    category: "Uncategorized",
    filename: __filename,
    use: "<command name>",
};

cmd(commandInfo, async (sock, buddy, m, { args, reply }) => {
    // React to the message with an emoji
    await sock.sendMessage(m.remoteJid, {
        react: {
            text: '📖',
            key: m.key
        }
    });

    try {
        // Check if a command name was provided in the arguments
        if (!args[0]) {
            return reply(
                `❌ Please specify a command.\n\nExample: ${config.PREFIX}help menu`
            );
        }

        const commandName = args[0].toLowerCase();
        
        // Find the command in the commands list by its pattern or alias
        const command = Object.values(commands).find(
            cmd => cmd.pattern === commandName || (cmd.alias && cmd.alias.includes(commandName))
        );

        // If the command is not found, send an error message
        if (!command) {
            return reply(
                `❌ Command *${commandName}* not found!\nUse *${config.PREFIX}menu* to view all commands.`
            );
        }

        // Build the help message string
        let helpMessage = `╭───『 *HELP FOR ${command.pattern.toUpperCase()}* 』───⳹
│
┃▸📄 *COMMAND*: ${command.pattern}
┃▸❕ *DESCRIPTION*: ${command.desc || 'No description available'}
┃▸📂 *CATEGORY*: ${command.category || 'Uncategorized'}
${command.alias?.length ? `┃▸🔹 *ALIASES*: ${command.alias.map(a => `.${a}`).join(', ')}` : ''}
${command.use ? `┃▸💡 *USAGE*: ${config.PREFIX}${command.pattern} ${command.use}` : ''}
│
╰──────────────⳹

📝 *Note*: Don't include <> when using the command!`;

        // Send the detailed help message
        reply(helpMessage);

    } catch (error) {
        console.error(error);
        reply("❌ An error occurred while fetching help information.");
    }
});
