const axios = require("axios");
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
const { generateWAMessageFromContent } = require('@whiskeysockets/baileys');

const { HEROKU_API_KEY, HEROKU_APP_NAME } = process.env;

module.exports = async (context) => {
    const { client, m, prefix } = context;

    const formatStylishReply = (message) => {
        return (
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `│❒ ${message}\n` +
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `> 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽 😈`
        );
    };

    await ownerMiddleware(context, async () => {
        await client.sendMessage(m.chat, { react: { text: '🔂', key: m.key } });

        try {
            if (!HEROKU_API_KEY || !HEROKU_APP_NAME) {
                return await client.sendMessage(
                    m.chat,
                    {
                        text: formatStylishReply(
                            "⚠️ Seriously? You forgot to set *HEROKU_API_KEY* or *HEROKU_APP_NAME*.\n" +
                            "Fix your setup before crying for updates. 🙄"
                        ),
                    },
                    { quoted: m }
                );
            }

            const githubRes = await axios.get(
                "https://api.github.com/repos/Qadeer-Xtech/QADEER-AI/commits/main"
            );

            const latestCommit = githubRes.data;
            const latestSha = latestCommit.sha;

            const herokuRes = await axios.get(
                `https://api.heroku.com/apps/${HEROKU_APP_NAME}/builds`,
                {
                    headers: {
                        Authorization: `Bearer ${HEROKU_API_KEY}`,
                        Accept: "application/vnd.heroku+json; version=3",
                    },
                }
            );

            const lastBuild = herokuRes.data[0];
            const deployedSha = lastBuild?.source_blob?.url || "";
            const alreadyDeployed = deployedSha.includes(latestSha);

            if (alreadyDeployed) {
                // FIX: Menambahkan wrapper viewOnceMessage
                const msg = generateWAMessageFromContent(
                    m.chat,
                    {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage: {
                                    body: {
                                        text: "Your bot is already on the latest version, genius."
                                    },
                                    footer: {
                                        text: "> 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽"
                                    },
                                    nativeFlowMessage: {
                                        buttons: [
                                            {
                                                name: "single_select",
                                                buttonParamsJson: JSON.stringify({
                                                    title: "Want something else?",
                                                    sections: [
                                                        {
                                                            rows: [
                                                                { title: "📱 Menu", description: "Get command list", id: `${prefix}menu` },
                                                                { title: "⚙ Settings", description: "Bot settings", id: `${prefix}settings` },
                                                            ],
                                                        },
                                                    ],
                                                }),
                                            },
                                        ],
                                    },
                                }
                            }
                        }
                    },
                    { quoted: m }
                );

                return await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
            }

            // FIX: Menambahkan wrapper viewOnceMessage
            const msg = generateWAMessageFromContent(
                m.chat,
                {
                    viewOnceMessage: {
                        message: {
                            interactiveMessage: {
                                body: {
                                    text: `🆕 Update Available, Dumbass\n\nNew version found. You're still using outdated garbage.\n\n📌 *Commit:* ${latestCommit.commit.message}\n👤 *Author:* ${latestCommit.commit.author.name}\n🕒 *Date:* ${new Date(latestCommit.commit.author.date).toLocaleString()}\n\nTo update your worthless bot, tap the button below. if you're unable to tap the buttons type ${prefix}triggerupdate Don't ask me how to tap, you monkey. 🐒😂`
                                },
                                footer: {
                                    text: "> 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽"
                                },
                                nativeFlowMessage: {
                                    buttons: [
                                        {
                                            name: "single_select",
                                            buttonParamsJson: JSON.stringify({
                                                title: "UPDATE OPTIONS",
                                                sections: [
                                                    {
                                                        title: "What do you want?",
                                                        rows: [
                                                            { title: "🚀 Trigger Update", description: "Update now", id: `${prefix}triggerupdate` },
                                                            { title: "📱 Menu", description: "Back to command list", id: `${prefix}menu` },
                                                        ],
                                                    },
                                                ],
                                            }),
                                        },
                                    ],
                                },
                            }
                        }
                    }
                },
                { quoted: m }
            );

            await client.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;

            let msg;

            if (errorMessage.includes("API key")) {
                msg =
                    "❌ Your Heroku API key is trash.\n" +
                    "Fix *HEROKU_API_KEY* before crying here.";
            } else if (errorMessage.includes("not found")) {
                msg =
                    "❌ Heroku app not found.\n" +
                    "Are you sure *HEROKU_APP_NAME* is correct, genius?";
            } else {
                msg = `❌ Update failed:\n${errorMessage}\nTry again without panicking.`;
            }

            await client.sendMessage(
                m.chat,
                { text: formatStylishReply(msg) },
                { quoted: m }
            );
        }
    });
};