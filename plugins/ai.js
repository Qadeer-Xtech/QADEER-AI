const {
    cmd
} = require('../command');
const axios = require('axios');

// Command: TofanAI (Default AI)
cmd({
    pattern: 'ai',
    alias: ['chatgpt', 'gpt'],
    desc: 'Chat with an AI model',
    category: 'ai',
    filename: __filename
}, async (sock, m, store, {
    from,
    args,
    q,
    reply
}) => {
    try {
        const query = q?.trim() || args.join(' ').trim();
        const remoteJid = m.key.remoteJid;

        if (!query) {
            await sock.sendMessage(remoteJid, {
                react: {
                    text: '❓',
                    key: m.key
                }
            });
            await sock.sendMessage(remoteJid, {
                text: '❓ Please provide a message for the AI.\n\nExample: `.ai Hello, how are you?`'
            }, {
                quoted: m
            });
            return;
        }

        const apiUrl = 'https://lance-frank-asta.onrender.com/api/gpt?q=' + encodeURIComponent(query);
        const {
            data: responseData
        } = await axios.get(apiUrl);

        if (!responseData || !responseData.message) {
            await sock.sendMessage(remoteJid, {
                react: {
                    text: '❌',
                    key: m.key
                }
            });
            await sock.sendMessage(remoteJid, {
                text: '⚠️ AI failed to respond. Please try again later.'
            }, {
                quoted: m
            });
            return;
        }

        await sock.sendMessage(remoteJid, {
            text: '🤖 *AI Response:*\n\n' + responseData.message
        }, {
            quoted: m
        });
        await sock.sendMessage(remoteJid, {
            react: {
                text: '✅',
                key: m.key
            }
        });

    } catch (error) {
        console.error('Error in AI command:', error);
        await sock.sendMessage(m.key.remoteJid, {
            react: {
                text: '❌',
                key: m.key
            }
        });
        await sock.sendMessage(m.key.remoteJid, {
            text: '⚠️ Error in this command.'
        }, {
            quoted: m
        });
    }
});

// Command: OpenAI (gpt4)
cmd({
    pattern: 'open-gpt',
    alias: ['gpt4', 'chatgpt4'],
    desc: 'Chat with OpenAI',
    category: 'ai',
    filename: __filename
}, async (sock, m, store, {
    from,
    args,
    q,
    reply
}) => {
    try {
        await sock.sendMessage(store.key.remoteJid, {
            react: {
                text: '🧠',
                key: store.key
            }
        });

        if (!q || q.toLowerCase() === 'no') {
            const usageText = '🧠 *Usage:*\n• openai <question>n\nExample: `.openai What is the capital of France?`';
            if (m.key.remoteJid.endsWith('@g.us')) {
                await sock.sendMessage(m.key.remoteJid, {
                    text: usageText
                }, {
                    quoted: m
                });
            } else {
                await sock.sendMessage(m.key.remoteJid, {
                    text: usageText
                });
            }
            return;
        }

        if (q.length > 500) {
            return await reply('❌ Your question is too long. Please keep it under 500 characters.');
        }

        const apiUrl = 'https://vapis.my.id/api/openai?q=' + encodeURIComponent(q);
        const {
            data: responseData
        } = await axios.get(apiUrl, {
            timeout: 10000
        });

        if (!responseData || !responseData.result) {
            await sock.sendMessage(m.key.remoteJid, {
                text: 'OpenAI failed to respond. Please try again later.'
            }, {
                quoted: m
            });
            return;
        }

        await sock.sendMessage(m.key.remoteJid, {
            text: '🧠 *OpenAI Response:*\n\n' + responseData.result
        }, {
            quoted: m
        });

    } catch (error) {
        console.error('❌ Error in OpenAI command:', error.message || error);
        await sock.sendMessage(m.key.remoteJid, {
            text: 'An error occurred while communicating with OpenAI.'
        }, {
            quoted: m
        });
    }
});

// Command: Gemini
cmd({
    pattern: 'gemini',
    alias: ['askgemini', 'gptgemini'],
    desc: 'Ask Gemini AI a question',
    category: 'ai',
    filename: __filename,
    use: '.gemini <your question>'
}, async (sock, m, store, {
    args,
    from,
    reply
}) => {
    const query = args.join(' ').trim();
    if (!query) {
        return reply('🧠 Please ask something like `.gemini what is consciousness?`');
    }
    await sock.sendMessage(from, {
        react: {
            text: '🔮',
            key: store.key
        }
    });

    try {
        const encodedQuery = encodeURIComponent(query);
        const apiUrl = 'https://api.nekorinn.my.id/ai/gemini?text=' + encodedQuery;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data?.status || !data?.result) {
            return reply('❌ Gemini AI couldn\'t generate a response.');
        }

        const resultText = '🧠 *𝐆𝐄𝐌𝐄𝐍𝐈 𝐀𝐈 𝐑𝐄𝐒𝐏𝐎𝐍𝐒𝐄*\n\n"' + data.result.trim() + '"\n\n— *𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*';
        await sock.sendMessage(from, {
            text: resultText
        }, {
            quoted: m
        });

    } catch (error) {
        console.error('Gemini AI Error:', error);
        reply('❌ An error occurred while contacting Gemini AI.');
    }
});


// Command: Meta LLaMA
cmd({
    pattern: 'metallama',
    alias: ['meta', 'llama'],
    desc: 'Ask Meta LLaMA AI a question',
    category: 'ai',
    filename: __filename,
    use: '.meta <your question>'
}, async (sock, m, store, {
    args,
    from,
    reply
}) => {
    const query = args.join(' ').trim();
    if (!query) {
        return reply('🦙 Please ask something like `.meta what is consciousness?`');
    }
    await sock.sendMessage(from, {
        react: {
            text: '🦙',
            key: store.key
        }
    });
    try {
        const encodedQuery = encodeURIComponent(query);
        const apiUrl = 'https://api.nekorinn.my.id/ai/meta-llama?text=' + encodedQuery;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data?.status || !data?.result) {
            return reply('❌ Meta LLaMA AI couldn\'t generate a response.');
        }

        const resultText = '🦙 *Meta LLaMA says:*\n\n' + data.result.trim() + '\n\n— *POWER OF QADEER*';
        await sock.sendMessage(from, {
            text: resultText
        }, {
            quoted: m
        });

    } catch (error) {
        console.error('Meta LLaMA Error:', error);
        reply('❌ An error occurred while contacting Meta LLaMA AI.');
    }
});

