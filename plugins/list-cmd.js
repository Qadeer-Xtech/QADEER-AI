// list-cmd.js
const config = require('../config');
const {
    cmd,
    commands
} = require('../command');
const {
    runtime
} = require('../lib/functions');

// Command to list all available commands
cmd({
    pattern: 'list',
    alias: ['menu', 'listcmds', 'listcommands'],
    desc: 'Show all available commands with descriptions',
    category: 'menuhelp',
    filename: __filename
}, async (bot, message, client, {
    from,
    reply
}) => {
    await bot.sendMessage(client.key.remoteJid, {
        react: {
            text: '📜',
            key: client.key
        }
    });

    try {
        const totalCommands = Object.keys(commands).length;
        let totalAliases = 0;
        Object.values(commands).forEach(command => {
            if (command.alias) {
                totalAliases += command.alias.length;
            }
        });

        const categories = [...new Set(Object.values(commands).map(cmd => cmd.category))];
        let responseText = `╭───『 *QADEER-AI COMMAND LIST* 』───⳹\n│\n│ *🛠️ BOT INFORMATION*\n│ • 🤖 Bot Name: QADEER-MD\n│ • 👑 Owner: ${config.OWNER_NAME}\n│ • ⚙️ Prefix: [ ${config.PREFIX} ]\n│ • 📦 Version: 4.0.0\n│ • 🕒 Runtime: ${runtime(process.uptime())}\n│\n│ *📊 COMMAND STATS*\n│ • 📜 Total Commands: ${totalCommands}\n│ • 🔄 Total Aliases: ${totalAliases}\n│ • 🗂️ Categories: ${categories.length}\n│\n`;

        const commandsByCategory = {};
        categories.forEach(category => {
            commandsByCategory[category] = Object.values(commands).filter(cmd => cmd.category === category);
        });

        for (const [category, cmds] of Object.entries(commandsByCategory)) {
            const aliasCount = cmds.reduce((acc, cmd) => acc + (cmd.alias ? cmd.alias.length : 0), 0);
            responseText += `╭───『 *${category.toUpperCase()}* 』───⳹\n│ • 📂 Commands: ${cmds.length}\n│ • 🔄 Aliases: ${aliasCount}\n│\n`;

            cmds.forEach(command => {
                responseText += `┃▸📄 COMMAND: .${command.pattern}\n`;
                responseText += `┃▸❕ ${command.desc || 'No description available'}\n`;
                if (command.alias && command.alias.length > 0) {
                    responseText += `┃▸🔹 ALIASES: ${command.alias.map(a => `.${a}`).join(', ')}\n`;
                }
                if (command.use) {
                    responseText += `┃▸💡 Usage: ${command.use}\n`;
                }
                responseText += '│\n';
            });
            responseText += '╰────────────────⳹\n';
        }

        responseText += `\n📝 *Note*: Use ${config.PREFIX}help <command name> for detailed help\n`;
        responseText += '> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽 🤖* ';

        await bot.sendMessage(from, {
            image: {
                url: 'https://qu.ax/Pusls.jpg'
            },
            caption: responseText,
            contextInfo: {
                mentionedJid: [client.sender],
                forwardingScore: 2,
                isForwarded: true
            }
        }, {
            quoted: message
        });

    } catch (error) {
        console.error("Command List Error:", error);
        reply(`❌ Error generating command list: ${error.message}`);
    }
});


// Command to get help for a specific command
cmd({
    pattern: 'help',
    alias: ['h', 'menuhelp'],
    desc: 'Get detailed info about a specific command',
    category: 'menuhelp',
    filename: __filename,
    use: '<command name>'
}, async (bot, message, client, {
    args,
    reply
}) => {
    await bot.sendMessage(client.key.remoteJid, {
        react: {
            text: '📖',
            key: client.key
        }
    });

    try {
        if (!args[0]) {
            return reply(`❌ Please specify a command.\n\nExample: *${config.PREFIX}help list*`);
        }

        const commandName = args[0].toLowerCase();
        const command = Object.values(commands).find(cmd =>
            cmd.pattern === commandName || (cmd.alias && cmd.alias.includes(commandName))
        );

        if (!command) {
            return reply(`❌ Command *${commandName}* not found!\nUse *${config.PREFIX}list* to view all commands.`);
        }

        let helpText = `╭───『 *HELP FOR ${config.PREFIX}${command.pattern}* 』───⳹\n│\n`;
        helpText += `┃▸📄 *COMMAND*: ${config.PREFIX}${command.pattern}\n`;
        helpText += `┃▸❕ *DESCRIPTION*: ${command.desc || 'No description available'}\n`;
        helpText += `┃▸📂 *CATEGORY*: ${command.category || 'Uncategorized'}\n`;

        if (command.alias && command.alias.length > 0) {
            helpText += `┃▸🔹 *ALIASES*: ${command.alias.map(a => `${config.PREFIX}${a}`).join(', ')}\n`;
        }

        helpText += `\n┃▸💡 *USAGE*: ${config.PREFIX}${command.pattern}${command.use ? ` ${command.use}` : ''}\n`;
        helpText += `\n╰────────────────⳹\n\n📝 *Note*: Don't include <> when using the command.\n`;

        reply(helpText);

    } catch (error) {
        console.error(error);
        reply('❌ An error occurred while fetching help information.');
    }
});
