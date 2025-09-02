// installplugin.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const {
    cmd
} = require('../command');

cmd({
    pattern: 'install',
    alias: ['installplugin'],
    desc: 'Install a plugin from a Gist (Creator Only)',
    category: 'owner',
    filename: __filename,
    use: '<raw-gist-url>'
}, async (bot, message, client, {
    args,
    from,
    reply,
    isPatron
}) => {
    try {
        if (!isPatron) {
            return reply('*📛 This command is restricted to owners only.*');
        }

        const gistUrl = args[0];
        if (!gistUrl) {
            return reply('❌ Please provide a Gist URL.\nExample: .install https://gist.githubusercontent.com/...');
        }

        // Security check to only allow installation from a specific user's gists
        if (!gistUrl.startsWith('https://gist.githubusercontent.com/Qadeer-Xtech')) {
            return reply('❌ Only Gists from https://gist.githubusercontent.com/Qadeer-Xtech are allowed.');
        }

        await bot.sendMessage(from, {
            react: {
                text: '⏳',
                key: message.key
            }
        });

        const url = new URL(gistUrl);
        let pluginName = path.basename(url.pathname) || 'plugin_' + Date.now() + '.js';

        if (!pluginName.endsWith('.js')) {
            pluginName += '.js';
        }

        const response = await axios.get(gistUrl, {
            timeout: 10000,
            headers: {
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.data) {
            return reply('❌ Empty response from Gist. Nothing to install.');
        }

        const pluginsDir = path.join(__dirname, '..', 'plugins');
        if (!fs.existsSync(pluginsDir)) {
            fs.mkdirSync(pluginsDir, {
                recursive: true
            });
        }

        const pluginPath = path.join(pluginsDir, pluginName);
        fs.writeFileSync(pluginPath, response.data, 'utf8');

        await reply(`✅ Plugin "${pluginName}" installed successfully.\n♻️ Restarting bot`);

        setTimeout(() => {
            process.exit(1); // Restart the process to apply the new plugin
        }, 1500);

    } catch (error) {
        console.error('Installation Error:', error);
        let errorMessage = '❌ Failed to install plugin.';

        if (error.code === 'ENOTFOUND') {
            errorMessage = '❌ Could not connect to Gist. Check your internet connection.';
        } else if (error.response?.status === 404) {
            errorMessage = '❌ Gist not found. Please check the URL.';
        } else if (error.message.includes('URL')) {
            errorMessage = '❌ Invalid URL format provided.';
        }
        reply(errorMessage);
    }
});
