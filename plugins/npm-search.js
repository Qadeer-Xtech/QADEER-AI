const axios = require('axios');
const { cmd } = require('../command');

cmd({
    pattern: 'npm',
    desc: 'Search for a package on npm.',
    category: 'convert',
    filename: __filename,
    use: '<package-name>'
}, async (bot, message, context, { from, args, reply }) => {
    try {
        await bot.sendMessage(message.key.remoteJid, {
            react: { text: '📦', key: message.key }
        });

        if (!args.length) {
            return reply('Please provide the name of the npm package you want to search for. Example: .npm express');
        }

        const packageName = args.join(' ');
        const apiUrl = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;

        const response = await axios.get(apiUrl);

        if (response.status !== 200) {
            throw new Error('Package not found or an error occurred.');
        }

        const pkgData = response.data;
        const latestVersion = pkgData['dist-tags'].latest;
        const description = pkgData.description || 'No description available.';
        const npmUrl = `https://www.npmjs.com/package/${packageName}`;
        const license = pkgData.license || 'Unknown';
        const repositoryUrl = pkgData.repository ? pkgData.repository.url : 'Not available';

        const replyText = `
*QADEER-AI NPM SEARCH*

*🔰 NPM PACKAGE:* ${packageName}
*📄 DESCRIPTION:* ${description}
*⏸️ LAST VERSION:* ${latestVersion}
*🪪 LICENSE:* ${license}
*🪩 REPOSITORY:* ${repositoryUrl}
*🔗 NPM URL:* ${npmUrl}
`;
        await bot.sendMessage(from, { text: replyText }, { quoted: message });

    } catch (error) {
        console.error('Error:', error);
        const errorDetails = `
*❌ NPM Command Error Logs*

*Error Message:* ${error.message}
*Stack Trace:* ${error.stack || 'Not available'}
*Timestamp:* ${new Date().toISOString()}
`;
        await bot.sendMessage(from, { text: errorDetails }, { quoted: message });
        reply('An error occurred while fetching the npm package details.');
    }
});
