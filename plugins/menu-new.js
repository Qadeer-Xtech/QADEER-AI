//menu-new.js
const config = require('../config');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: 'menu',
    desc: 'Show interactive menu system',
    category: 'menu',
    filename: __filename
}, async (client, message, afk, { from, reply }) => {

    await client.sendMessage(afk.key['remoteJid'], { react: { text: '🤖', key: afk.key } });

    try {
        const initialMenuText = `            ║ 𝐐𝐀𝐃𝐄𝐄𝐑-𝐀𝐈 ║ 
                      
╔═════════════╗
║ 👤 *Owner* : *${config.OWNER_NAME}*
║ 📦 *Library* : *Baileys AI*
║ 🚦 *Mode* : *[ ${config.MODE} ]*
║ 🔖 *Prefix* : *[ ${config.PREFIX} ]*
║ 📌 *Version* : *4.0.0 Global*
╚═════════╝

💡 Tip: Use *${config.PREFIX}patron* to view full bot info.
📲 *Reply this message with a number to access a menu.*
⚠️ *Some commands might not be in this menu so use ${config.PREFIX}allmenu or ${config.PREFIX}menu3 command*

╭─ ✨ 𝗖𝗔𝗧𝗘𝗚𝗢𝗥𝗜𝗘𝗦 ─╮
│ 1️⃣  ⬇️  *Download Tools*
│ 2️⃣  💬  *Group Features*
│ 3️⃣  🎉  *Fun & Games*
│ 4️⃣  🛠️  *Owner Commands*
│ 5️⃣  🧠  *AI & ChatGPT*
│ 6️⃣  🌸  *Anime Tools*
│ 7️⃣  🔧  *File Conversion*
│ 8️⃣  🧰  *Utilities & Extras*
│ 9️⃣  💬  *Reactions*
│ 🔟  🏠  *Main Menu*
│ 1️⃣1️⃣ ⚙️  *Settings*
╰───────────╯

> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* `;

        const contextInfo = {
            mentionedJid: [afk.sender],
            forwardingScore: 2,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363345872435489@newsletter',
                newsletterName: '𝚀𝙰𝙳𝙴𝙴𝚁_𝙺𝙷𝙰𝙽',
                serverMessageId: 143
            }
        };

        const sendInitialImage = async () => {
            try {
                return await client.sendMessage(from, {
                    image: { url: 'https://qu.ax/Pusls.jpg' },
                    caption: initialMenuText,
                    contextInfo: contextInfo
                }, { quoted: message });
            } catch (e) {
                console.log('Image send failed, falling back to text');
                return await client.sendMessage(from, { text: initialMenuText, contextInfo: contextInfo }, { quoted: message });
            }
        };

        const sendFollowUpAudio = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                await client.sendMessage(from, {
                    audio: { url: 'https://github.com/Qadeer-Xtech/TOFAN-DATA/raw/refs/heads/main/autovoice/lost-astro.mp3' },
                    mimetype: 'audio/mp4',
                    ptt: true
                }, { quoted: message });
            } catch (e) {
                console.log('Audio send failed, continuing without it');
            }
        };

        let menuMessage;
        try {
            [menuMessage] = await Promise.all([
                Promise.race([sendInitialImage(), new Promise((_, reject) => setTimeout(() => reject(new Error('Image send timeout')), 10000))]),
                Promise.race([sendFollowUpAudio(), new Promise((_, reject) => setTimeout(() => reject(new Error('Audio send timeout')), 8000))])
            ]);
        } catch (error) {
            console.log("Handler error:", error);
            if (!menuMessage) {
                menuMessage = await client.sendMessage(from, { text: initialMenuText, contextInfo: contextInfo }, { quoted: message });
            }
        }

        const menuMessageId = menuMessage.key.id;

        const menuOptions = {
            '1': {
                title: '📥 *Download Menu* 📥',
                content: `╭━━━〔 *Download Menu* 〕━━━┈⊷\n┃★ *ᴜsᴇ ${config.PREFIX}ᴛᴏғᴀɴ ᴛᴏ sᴇᴇ ᴍᴏʀᴇ ᴅᴇᴛᴀɪʟs ᴀʙᴏᴜᴛ ᴛʜᴇ ʙᴏᴛ* \n┃★╭──────────────\n┃★│ 🌐 *Social Media*\n┃★│ • facebook [url]\n┃★│ • facebook2 [url]\n┃★│ • mediafire [url]\n┃★│ • tiktok [url]\n┃★│ • tiktok2 [url]\n┃★│ • twitter [url]\n┃★│ • Insta [url]\n┃★│ • Insta2 [url]\n┃★│ • apk [app]\n┃★│ • img [query]\n┃★│ • ttsearch [query]\n┃★│ • tt2 [url]\n┃★│ • pins [url]\n┃★│ • modapk [app]\n┃★│ • fb2 [url]\n┃★│ • ssweb [url]\n┃★│ • pinterest [url]\n┃★╰──────────────\n┃★╭──────────────\n┃★│ 🎵 *Music/Video*\n┃★│ • spotify [query]\n┃★│ • lyrics [song]\n┃★│ • play [song]\n┃★│ • play2 [song]\n┃★│ • play3 [song]\n┃★│ • audio [url]\n┃★│ • video [url]\n┃★│ • video2 [url]\n┃★│ • ytmp3 [url]\n┃★│ • ytmp4 [url]\n┃★│ • song [name]\n┃★│ • darama [name]\n┃★╰──────────────\n╰━━━━━━━━━━━━━━━┈⊷\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* `,
                image: true
            },
            '2': {
                title: '👥 *Group Menu* 👥',
                content: `╭━━━〔 *Group Menu* 〕━━━┈⊷\n┃★ *ᴜsᴇ ${config.PREFIX}ᴛᴏғᴀɴ ᴛᴏ sᴇᴇ ᴍᴏʀᴇ ᴅᴇᴛᴀɪʟs ᴀʙᴏᴜᴛ ᴛʜᴇ ʙᴏᴛ* \n┃★╭──────────────\n┃★│ 🛠️ *Management*\n┃★│ • grouplink\n┃★│ • kickall\n┃★│ • add @user\n┃★│ • remove @user\n┃★│ • kick @user\n┃★│ • out (*234)\n┃★│ • pdm\n┃★│ • savecontact\n┃★╰──────────────\n┃★╭──────────────\n┃★│ ⚡ *Admin Tools*\n┃★│ • promote @user\n┃★│ • demote @user\n┃★│ • dismiss \n┃★│ • anti-tag\n┃★│ • revoke\n┃★│ • mute\n┃★│ • unmute\n┃★│ • lockgc\n┃★│ • unlockgc\n┃★╰──────────────\n┃★╭──────────────\n┃★│ 🏷️ *Tagging*\n┃★│ • tag @user\n┃★│ • hidetag [msg]\n┃★│ • tagall\n┃★│ • tagadmins\n┃★│ • broadcast\n┃★│ • broadcast2\n┃★│ • invite\n┃★│ • sendinvite\n┃★╰──────────────\n╰━━━━━━━━━━━━━━━┈⊷\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* `,
                image: true
            },
            '3': {
                title: '😄 *Fun Menu* 😄',
                content: `╭━━━〔 *Fun Menu* 〕━━━┈⊷\n┃★ *ᴜsᴇ ${config.PREFIX}ᴛᴏғᴀɴ ᴛᴏ sᴇᴇ ᴍᴏʀᴇ ᴅᴇᴛᴀɪʟs ᴀʙᴏᴜᴛ ᴛʜᴇ ʙᴏт* \n┃★╭──────────────\n┃★│ 🎭 *Interactive*\n┃★│ • shapar\n┃★│ • rate @user\n┃★│ • insult @user\n┃★│ • hack @user\n┃★│ • ship @user1 @user2\n┃★│ • character\n┃★│ • pickup\n┃★│ • joke\n┃★╰──────────────\n┃★╭──────────────\n┃★│ 🎲 *Games*\n┃★│ • squidgame\n┃★│ • wrg\n┃★│ • ttt\n┃★│ • tttstop\n┃★│ • truth\n┃★│ • dare\n┃★│ • flirt\n┃★│ • fact\n┃★╰──────────────\n┃★╭──────────────\n┃★│ 😂 *Reactions*\n┃★│ • hrt\n┃★│ • hpy\n┃★│ • syd\n┃★│ • anger\n┃★│ • shy\n┃★│ • kiss\n┃★│ • mon\n┃★│ • cunfuzed\n┃★╰──────────────\n╰━━━━━━━━━━━━━━━┈⊷\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* `,
                image: true
            },
            '4': {
                title: '👑 *Owner Menu* 👑',
                content: `╭━━━〔 *Owner Menu* 〕━━━┈⊷\n┃★ *ᴜsᴇ ${config.PREFIX}ᴛᴏғᴀɴ ᴛᴏ sᴇᴇ ᴍᴏʀᴇ ᴅᴇᴛᴀɪʟs ᴀʙᴏᴜᴛ ᴛʜᴇ ʙᴏᴛ* \n┃★╭──────────────\n┃★│ ⚠️ *Restricted*\n┃★│ • block @user\n┃★│ • unblock @user\n┃★│ • anti-delete on/off/status\n┃★│ • repost\n┃★│ • getpp\n┃★│ • getgpp\n┃★│ • setpp [img]\n┃★│ • setcmd [command]\n┃★│ • delcmd [command]\n┃★│ • listcmd\n┃★│ • listsudo\n┃★│ • setsudo @user\n┃★│ • delsudo @user\n┃★│ • restart\n┃★│ • shutdown\n┃★│ • update\n┃★│ • checkupdate\n┃★│ • setaza\n┃★│ • creact\n┃★│ • install\n┃★│ • aza\n┃★│ • vv\n┃★│ • vv2 / nice\n┃★│ • pfilter\n┃★│ • gfilter\n┃★│ • listfilter\n┃★│ • pstop\n┃★│ • gstop\n┃★╰───────────🤖🤖🤖──\n┃★╭──────────────\n┃★│ ℹ️ *Info Tools*\n┃★│ • gjid\n┃★│ • jid @user\n┃★│ • listcmd\n┃★│ • allmenu\n┃★╰──────────────\n╰━━━━━━━━━━━━━━━┈⊷\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* `,
                image: true
            },
            '5': {
                title: '🤖 *AI Menu* 🤖',
                content: `╭━━━〔 *AI Menu* 〕━━━┈⊷\n┃★ *ᴜsᴇ ${config.PREFIX}ᴛᴏғᴀɴ ᴛᴏ sᴇᴇ ᴍᴏʀᴇ ᴅᴇᴛᴀɪʟs ᴀʙᴏᴜᴛ ᴛʜᴇ ʙᴏᴛ* \n┃★╭──────────────\n┃★│ 💬 *Chat AI*\n┃★│ • tofanai [query]\n┃★│ • openai [query]\n┃★│ • gpt [query]\n┃★│ • nowai [query]\n┃★│ • gemini [query]\n┃★│ • meta [query]\n┃★│ • grok [query]\n┃★│ • deepseek [query]\n┃★│ • chatbot [on/off]\n┃★╰──────────────\n┃★╭──────────────\n┃★│ 🖼️ *Generator AI*\n┃★│ • veo3fast [prompt]\n┃★│ • text2video [prompt]\n┃★│ • text2image [prompt]\n┃★│ • nowart [prompt]\n┃★│ • imagine [prompt]\n┃★│ • imagine2 [prompt]\n┃★│ • imagine3 [prompt]\n┃★╰──────────────\n╰━━━━━━━━━━━━━━━┈⊷\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* `,
                image: true
            },
            '6': {
                title: '🎎 *Anime Menu* 🎎',
                content: `╭━━━〔 *Anime Menu* 〕━━━┈⊷\n┃★ *ᴜsᴇ ${config.PREFIX}ᴛᴏғᴀɴ ᴛᴏ sᴇᴇ ᴍᴏʀᴇ ᴅᴇᴛᴀɪʟs ᴀʙᴏᴜᴛ ᴛʜᴇ ʙᴏᴛ* \n┃★╭──────────────\n┃★│ 🖼️ *Images*\n┃★│ • fack\n┃★│ • dog\n┃★│ • awoo\n┃★│ • garl\n┃★│ • waifu\n┃★│ • neko\n┃★│ • megnumin\n┃★│ • maid\n┃★│ • loli\n┃★╰──────────────\n┃★╭──────────────\n┃★│ 🎭 *Characters*\n┃★│ • animegirl\n┃★│ • animegirl1-5\n┃★│ • anime1-5\n┃★│ • foxgirl\n┃★│ • naruto\n┃★╰──────────────\n╰━━━━━━━━━━━━━━━┈⊷\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* `,
                image: true
            },
            '7': {
                title: '🔄 *Convert Menu* 🔄',
                content: `╭━━━〔 *Convert Menu* 〕━━━┈⊷\n┃★ *ᴜsᴇ ${config.PREFIX}ᴛᴏғᴀɴ ᴛᴏ sᴇᴇ ᴍᴏʀᴇ ᴅᴇᴛᴀɪʟs ᴀʙᴏᴜᴛ ᴛʜᴇ ʙᴏᴛ* \n┃★╭──────────────\n┃★│ 🖼️ *Media*\n┃★│ • sticker [img]\n┃★│ • sticker2 [img]\n┃★┃ • quoted [reply/text]\n┃★│ • emojimix 😎+😂\n┃★│ • take [name,text]\n┃★│ • toimg [sticker]\n┃★│ • topdf \n┃★│ • toptt\n┃★│ • tourl\n┃★│ • getimage\n┃★│ • shorturl [url]\n┃★│ • tohd\n┃★│ • toaudio [video]\n┃★│ • veo3fast [text]\n┃★│ • text2video [text]\n┃★╰──────────────\n┃★╭──────────────\n┃★│ 📝 *Text*\n┃★│ • fancy [text]\n┃★│ • tts [text]\n┃★│ • tts2 [text]\n┃★│ • tts3 [text]\n┃★│ • trt [text]\n┃★│ • base64 [text]\n┃★│ • unbase64 [text]\n┃★╰──────────────\n╰━━━━━━━━━━━━━━━┈⊷\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* `,
                image: true
            },
            '8': {
                title: '📌 *Other Menu* 📌',
                content: `╭━━━〔 *Other Menu* 〕━━━┈⊷\n┃★ *ᴜsᴇ ${config.PREFIX}ᴛᴏғᴀɴ ᴛᴏ sᴇᴇ ᴍᴏʀᴇ ᴅᴇᴛᴀɪʟs ᴀʙᴏᴜᴛ ᴛʜᴇ ʙᴏᴛ* \n┃★╭──────────────\n┃★│ 🕒 *Utilities*\n┃★│ • timenow\n┃★│ • date\n┃★│ • removebg\n┃★│ • imgscan\n┃★│ • count [num]\n┃★│ • calculate [expr]\n┃★│ • otpbox [full-number]\n┃★│ • tempnum [country]\n┃★│ • templist [country]\n┃★│ • ytstalk\n┃★│ • wstalk\n┃★│ • tiktokstalk\n┃★│ • xstalk\n┃★│ • countx\n┃★╰──────────────\n┃★╭──────────────\n┃★│ 🎲 *Random*\n┃★│ • flip\n┃★│ • coinflip\n┃★│ • rcolor\n┃★│ • roll\n┃★│ • fact\n┃★╰──────────────\n┃★╭──────────────\n┃★│ 🔍 *Search*\n┃★│ • define [word]\n┃★│ • news [query]\n┃★│ • bible\n┃★│ • cinfo\n┃★│ • movie [name]\n┃★│ • weather [loc]\n┃★╰──────────────\n╰━━━━━━━━━━━━━━━┈⊷\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* `,
                image: true
            },
            '9': {
                title: '💞 *Reactions Menu* 💞',
                content: `╭━━━〔 *Reactions Menu* 〕━━━┈⊷\n┃★ *ᴜsᴇ ${config.PREFIX}ᴛᴏғᴀɴ ᴛᴏ sᴇᴇ ᴍᴏʀᴇ ᴅᴇᴛᴀɪʟs ᴀʙᴏᴜᴛ ᴛʜᴇ ʙᴏᴛ* \n┃★╭──────────────\n┃★│ ❤️ *Affection*\n┃★│ • cuddle @user\n┃★│ • hug @user\n┃★│ • kiss @user\n┃★│ • lick @user\n┃★│ • pat @user\n┃★╰──────────────\n┃★╭──────────────\n┃★│ 😂 *Funny*\n┃★│ • bully @user\n┃★│ • bonk @user\n┃★│ • yeet @user\n┃★│ • slap @user\n┃★│ • kill @user\n┃★╰──────────────\n┃★╭──────────────\n┃★│ 😊 *Expressions*\n┃★│ • blush @user\n┃★│ • smile @user\n┃★│ • happy @user\n┃★│ • wink @user\n┃★│ • poke @user\n┃★╰──────────────\n╰━━━━━━━━━━━━━━━┈⊷\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* `,
                image: true
            },
            '10': {
                title: '🏠 *Main Menu* 🏠',
                content: `╭━━━〔 *Main Menu* 〕━━━┈⊷\n┃★ *ᴜsᴇ ${config.PREFIX}ᴛᴏғᴀɴ ᴛᴏ sᴇᴇ ᴍᴏʀᴇ ᴅᴇᴛᴀɪʟs ᴀʙᴏᴜᴛ ᴛʜᴇ ʙᴏᴛ* \n┃★╭──────────────\n┃★│ ℹ️ *Bot Info*\n┃★│ • ping\n┃★│ • ping2\n┃★│ • version\n┃★│ • alive\n┃★│ • alive2\n┃★│ • runtime\n┃★│ • uptime\n┃★│ • repo\n┃★│ • owner\n┃★╰──────────────\n┃★╭──────────────\n┃★│ 🛠️ *Games*\n┃★│ • squidgame\n┃★│ • wrg\n┃★│ • ttt\n┃★│ • truth\n┃★│ • dare\n┃★│ • flirt\n┃★│ • fact\n┃★│ • *More soon*\n┃★╰──────────────\n┃★╭──────────────\n┃★│ 🛠️ *Controls*\n┃★│ • menu\n┃★│ • menu2\n┃★│ • menu3\n┃★│ • restart\n┃★╰──────────────\n╰━━━━━━━━━━━━━━━┈⊷\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* `,
                image: true
            },
            '11': {
                title: '⚙️ *Settings Menu* ⚙️',
                content: `╭━━━〔 *Settings Menu* 〕━━━┈⊷\n┃★ *ᴜsᴇ ${config.PREFIX}ᴛᴏғᴀɴ ᴛᴏ sᴇᴇ ᴍᴏʀᴇ ᴅᴇᴛᴀɪʟs ᴀʙᴏᴜᴛ ᴛʜᴇ ʙᴏᴛ* \n┃★╭──────────────\n┃★│ 🔧 *Bot Settings*\n┃★│ • allvar [view all settings]\n┃★│ • setprefix [prefix]\n┃★│ • mode [private/public]\n┃★│ • auto-typing [on/off]\n┃★│ • mention-reply [on/off]\n┃★│ • always-online [on/off]\n┃★│ • auto-recording [on/off]\n┃★│ • auto-seen [on/off]\n┃★│ • status-react [on/off]\n┃★│ • read-message [on/off]\n┃★│ • anti-bad [on/off]\n┃★│ • auto-reply [on/off]\n┃★│ • auto-react [on/off]\n┃★│ • status-reply [on/off]\n┃★│ • sticker-name [name]\n┃★│ • custom-react [on/off]\n┃★│ • status-msg [message]\n┃★│ • antidel-path [same/log]\n┃★│ • setcustomemojis [emojis]\n┃★│ • owner-number [number]\n┃★│ • owner-name [name]\n┃★│ •  anti-call [on/off] \n┃★╰──────────────\n╰━━━━━━━━━━━━━━━┈⊷\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* `,
                image: true
            }
        };

        const messageHandler = async (update) => {
            try {
                const incomingMessage = update.messages[0];
                if (!incomingMessage?.message || !incomingMessage.key?.remoteJid) return;

                const isReplyToMenu = incomingMessage.message?.extendedTextMessage?.contextInfo?.stanzaId === menuMessageId;

                if (isReplyToMenu) {
                    const userResponse = incomingMessage.message.conversation || incomingMessage.message.extendedTextMessage?.text;
                    const remoteJid = incomingMessage.key.remoteJid;

                    if (menuOptions[userResponse]) {
                        const selectedMenu = menuOptions[userResponse];
                        try {
                            if (selectedMenu.image) {
                                await client.sendMessage(remoteJid, {
                                    image: { url: 'https://qu.ax/Pusls.jpg' },
                                    caption: selectedMenu.content,
                                    contextInfo: contextInfo
                                }, { quoted: incomingMessage });
                            } else {
                                await client.sendMessage(remoteJid, { text: selectedMenu.content, contextInfo: contextInfo }, { quoted: incomingMessage });
                            }
                            await client.sendMessage(remoteJid, { react: { text: '✅', key: incomingMessage.key } });
                        } catch (err) {
                            console.log('Menu reply error:', err);
                            await client.sendMessage(remoteJid, { text: selectedMenu.content, contextInfo: contextInfo }, { quoted: incomingMessage });
                        }
                    } else {
                        await client.sendMessage(remoteJid, {
                            text: '❌ *Invalid Option!* ❌\n\nPlease reply with a number between 1-11 to select a menu.\n\n*Example:* Reply with "1" for Download Menu\n\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* ',
                            contextInfo: contextInfo
                        }, { quoted: incomingMessage });
                    }
                }
            } catch (error) {
                console.log('Menu system is currently busy. Please try again later.\n\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* ', error);
            }
        };

        client.ev.on('messages.upsert', messageHandler);

        setTimeout(() => {
            client.ev.off('messages.upsert', messageHandler);
        }, 300000); // 5 minutes

    } catch (error) {
        console.error('Menu send error:', error);
        try {
            await client.sendMessage(from, { text: '❌ Menu system is currently busy. Please try again later.\n\n> *© 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙰𝙸 🤖* ' }, { quoted: message });
        } catch (finalError) {
            console.log('Final error handling failed:', finalError);
        }
    }
});
