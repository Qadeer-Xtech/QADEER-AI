// File: group-poll.js
const { cmd } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;

cmd({
    pattern: 'poll',
    category: 'group',
    desc: 'Create a poll with a question and options in the group.',
    filename: __filename
}, async (bot, msg, text, { from, body, reply }) => {
    try {
        // The expected format is: .poll What is your favorite color?; Blue, Red, Green
        const commandText = body.replace(prefix + 'poll', '').trim();
        const [question, optionsStr] = commandText.split(';');

        if (!question || !optionsStr) {
            return reply(`Usage: ${prefix}poll question; option1, option2, option3...`);
        }

        // Create a clean array of poll options
        const options = optionsStr.split(',')
            .map(opt => opt.trim())
            .filter(opt => opt !== '');

        if (options.length < 2) {
            return reply('*Please provide at least two options for the poll.*');
        }

        await bot.sendMessage(from, {
            poll: {
                name: question.trim(),
                values: options,
                selectableCount: 1
            }
        }, { quoted: msg });

    } catch (error) {
        return reply(`*An error occurred while processing your request.*\n\n_Error:_ ${error.message}`);
    }
});
