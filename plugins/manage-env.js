const { cmd, commands } = require('../command');
const config = require('../config');
const prefix = config.PREFIX;
const fs = require('fs');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, sleep, fetchJson } = require('../lib/functions2');
const { writeFileSync } = require('fs');
const path = require('path');

cmd({
    pattern: "admin-events",
    alias: ["adminevents"],
    desc: "Enable or disable admin event notifications",
    category: "settings",
    filename: __filename
},
async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ADMIN_EVENTS = "true";
        return await conn.sendMessage(from, { text: "✅ ᴀᴅᴍɪɴ ᴇᴠᴇɴᴛ ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴs ᴀʀᴇ ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ." }, { quoted: m });
    } else if (status === "off") {
        config.ADMIN_EVENTS = "false";
        return await conn.sendMessage(from, { text: "❌ ᴀᴅᴍɪɴ ᴇᴠᴇɴᴛ ɴᴏᴛɪғɪᴄᴀᴛɪᴏɴs ᴀʀᴇ ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ." }, { quoted: m });
    } else {
        return await conn.sendMessage(from, { text: `*Example:* ${prefix}admin-events on` }, { quoted: m });
    }
});

cmd({
    pattern: "welcome",
    alias: ["welcomeset"],
    desc: "Enable or disable welcome messages for new members",
    category: "settings",
    filename: __filename
},
async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.WELCOME = "true";
        return await conn.sendMessage(from, { text: "✅  ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ." }, { quoted: m });
    } else if (status === "off") {
        config.WELCOME = "false";
        return await conn.sendMessage(from, { text: "❌ ᴡᴇʟᴄᴏᴍᴇ ᴍᴇssᴀɢᴇs ᴀʀᴇ ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ." }, { quoted: m });
    } else {
        return await conn.sendMessage(from, { text: `*Example:* ${prefix}welcome on` }, { quoted: m });
    }
});

cmd({
    pattern: "mode",
    alias: ["setmode"],
    react: "🫟",
    desc: "Set bot mode to private or public.",
    category: "settings",
    filename: __filename,
}, async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    if (!args[0]) {
        const replyText = `📌 *Current mode:* *${config.MODE}*\n\n*Usage:* ${prefix}mode private OR ${prefix}mode public`;
        return await conn.sendMessage(from, { text: replyText }, { quoted: m });
    }

    const modeArg = args[0].toLowerCase();

    if (modeArg === "private") {
        config.MODE = "private";
        return await conn.sendMessage(from, { text: "✅  ʙᴏᴛ ᴍᴏᴅᴇ ɪꜱ ɴᴏᴡ ꜱᴇᴛ ᴛᴏ *ᴩʀɪᴠᴀᴛᴇ*." }, { quoted: m });
    } else if (modeArg === "public") {
        config.MODE = "public";
        return await conn.sendMessage(from, { text: "✅ ʙᴏᴛ ᴍᴏᴅᴇ ɪs ɴᴏᴡ sᴇᴛ ᴛᴏ *ᴘᴜʙʟɪᴄ*." }, { quoted: m });
    } else {
        return await conn.sendMessage(from, { text: `❌ ɪɴᴠᴀʟɪᴅ ᴍᴏᴅᴇ. ᴘʟᴇᴀsᴇ ᴜsᴇ \`${prefix}mode private\` ᴏʀ \`${prefix}mode public\`.` }, { quoted: m });
    }
});

cmd({
    pattern: "auto-typing",
    alias: ["autotyping"],
    description: "Enable or disable auto-typing feature.",
    category: "settings",
    filename: __filename
},    
async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
        return await conn.sendMessage(from, { text: `*🫟 ᴇxᴀᴍᴘʟᴇ:  ${prefix}auto-typing ᴏɴ*` }, { quoted: m });
    }

    config.AUTO_TYPING = status === "on" ? "true" : "false";
    return await conn.sendMessage(from, { text: `ᴀᴜᴛᴏ ᴛʏᴘɪɴɢ ʜᴀs ʙᴇᴇɴ ᴛᴜʀɴᴇᴅ ${status}.` }, { quoted: m });
});

cmd({
    pattern: "mention-reply",
    alias: ["menetionreply", "mee"],
    description: "Enable or disable the mention reply feature.",
    category: "settings",
    filename: __filename
},    
async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.MENTION_REPLY = "true";
        return await conn.sendMessage(from, { text: "Mention Reply feature is now enabled." }, { quoted: m });
    } else if (status === "off") {
        config.MENTION_REPLY = "false";
        return await conn.sendMessage(from, { text: "Mention Reply feature is now disabled." }, { quoted: m });
    } else {
        return await conn.sendMessage(from, { text: `*Example:* ${prefix}mee on` }, { quoted: m });
    }
});

cmd({
    pattern: "always-online",
    alias: ["alwaysonline"],
    desc: "Enable or disable the always online mode",
    category: "settings",
    filename: __filename
},
async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ALWAYS_ONLINE = "true";
        return await conn.sendMessage(from, { text: "*✅ ᴀʟᴡᴀʏs ᴏɴʟɪɴᴇ ᴍᴏᴅᴇ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ.*" }, { quoted: m });
    } else if (status === "off") {
        config.ALWAYS_ONLINE = "false";
        return await conn.sendMessage(from, { text: "*❌ ᴀʟᴡᴀʏs ᴏɴʟɪɴᴇ ᴍᴏᴅᴇ ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ.*" }, { quoted: m });
    } else {
        return await conn.sendMessage(from, { text: `*🛠️ ᴇxᴀᴍᴘʟᴇ: ${prefix}always-online ᴏɴ*` }, { quoted: m });
    }
});

cmd({
    pattern: "auto-recording",
    alias: ["autorecoding"],
    description: "Enable or disable auto-recording feature.",
    category: "settings",
    filename: __filename
},    
async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    const status = args[0]?.toLowerCase();
    if (!["on", "off"].includes(status)) {
        return await conn.sendMessage(from, { text: `*🫟 ᴇxᴀᴍᴘʟᴇ: ${prefix}auto-recording ᴏɴ*` }, { quoted: m });
    }

    config.AUTO_RECORDING = status === "on" ? "true" : "false";
    if (status === "on") {
        await conn.sendPresenceUpdate("recording", from);
        return await conn.sendMessage(from, { text: "ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ. ʙᴏᴛ ɪs ʀᴇᴄᴏʀᴅɪɴɢ..." }, { quoted: m });
    } else {
        await conn.sendPresenceUpdate("available", from);
        return await conn.sendMessage(from, { text: "ᴀᴜᴛᴏ ʀᴇᴄᴏʀᴅɪɴɢ ʜᴀs ʙᴇᴇɴ ᴅɪsᴀʙʟᴇᴅ." }, { quoted: m });
    }
});

cmd({
    pattern: "auto-seen",
    alias: ["autostatusview"],
    desc: "Enable or disable auto-viewing of statuses",
    category: "settings",
    filename: __filename
},    
async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_STATUS_SEEN = "true";
        return await conn.sendMessage(from, { text: "ᴀᴜᴛᴏ-ᴠɪᴇᴡɪɴɢ ᴏғ sᴛᴀᴛᴜsᴇs ɪs ɴᴏᴡ ᴇɴᴀʙʟᴇᴅ." }, { quoted: m });
    } else if (status === "off") {
        config.AUTO_STATUS_SEEN = "false";
        return await conn.sendMessage(from, { text: "ᴀᴜᴛᴏ-ᴠɪᴇᴡɪɴɢ ᴏғ sᴛᴀᴛᴜsᴇs ɪs ɴᴏᴡ ᴅɪsᴀʙʟᴇᴅ." }, { quoted: m });
    } else {
        return await conn.sendMessage(from, { text: `*🫟 ᴇxᴀᴍᴘʟᴇ:  ${prefix}auto-seen ᴏɴ*` }, { quoted: m });
    }
}); 

cmd({
    pattern: "status-react",
    alias: ["statusreact"],
    desc: "Enable or disable auto-reacting to statuses",
    category: "settings",
    filename: __filename
},    
async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_STATUS_REACT = "true";
        return await conn.sendMessage(from, { text: "Auto-reacting to statuses is now enabled." }, { quoted: m });
    } else if (status === "off") {
        config.AUTO_STATUS_REACT = "false";
        return await conn.sendMessage(from, { text: "Auto-reacting to statuses is now disabled." }, { quoted: m });
    } else {
        return await conn.sendMessage(from, { text: `*Example:* ${prefix}status-react on` }, { quoted: m });
    }
});

cmd({
    pattern: "read-message",
    alias: ["autoread"],
    desc: "Enable or disable auto-read messages.",
    category: "settings",
    filename: __filename
},    
async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.READ_MESSAGE = "true";
        return await conn.sendMessage(from, { text: "Read-message feature is now enabled." }, { quoted: m });
    } else if (status === "off") {
        config.READ_MESSAGE = "false";
        return await conn.sendMessage(from, { text: "Read-message feature is now disabled." }, { quoted: m });
    } else {
        return await conn.sendMessage(from, { text: `*Example:* ${prefix}read-message on` }, { quoted: m });
    }
});

cmd({
    pattern: "anti-bad",
    alias: ["antibadword"],
    desc: "Enable or disable anti-bad-word.",
    category: "settings",
    filename: __filename
},    
async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.ANTI_BAD_WORD = "true";
        return await conn.sendMessage(from, { text: "*Anti-bad-word is now enabled.*" }, { quoted: m });
    } else if (status === "off") {
        config.ANTI_BAD_WORD = "false";
        return await conn.sendMessage(from, { text: "*Anti-bad-word feature is now disabled*" }, { quoted: m });
    } else {
        return await conn.sendMessage(from, { text: `*Example:* ${prefix}anti-bad on` }, { quoted: m });
    }
});

cmd({
    pattern: "auto-sticker",
    alias: ["autosticker"],
    desc: "Enable or disable auto-sticker.",
    category: "settings",
    filename: __filename
},    
async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_STICKER = "true";
        return await conn.sendMessage(from, { text: "Auto-sticker feature is now enabled." }, { quoted: m });
    } else if (status === "off") {
        config.AUTO_STICKER = "false";
        return await conn.sendMessage(from, { text: "Auto-sticker feature is now disabled." }, { quoted: m });
    } else {
        return await conn.sendMessage(from, { text: `*Example:* ${prefix}auto-sticker on` }, { quoted: m });
    }
});

cmd({
    pattern: "auto-reply",
    alias: ["autoreply"],
    desc: "Enable or disable auto-reply.",
    category: "settings",
    filename: __filename
},    
async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_REPLY = "true";
        return await conn.sendMessage(from, { text: "*Auto-reply is now enabled.*" }, { quoted: m });
    } else if (status === "off") {
        config.AUTO_REPLY = "false";
        return await conn.sendMessage(from, { text: "Auto-reply feature is now disabled." }, { quoted: m });
    } else {
        return await conn.sendMessage(from, { text: `*🫟 ᴇxᴀᴍᴘʟᴇ: ${prefix}auto-reply ᴏɴ*` }, { quoted: m });
    }
});

cmd({
    pattern: "auto-react",
    alias: ["autoreact"],
    desc: "Enable or disable the autoreact feature",
    category: "settings",
    filename: __filename
},    
async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_REACT = "true";
        return await conn.sendMessage(from, { text: "*Autoreact feature is now enabled.*" }, { quoted: m });
    } else if (status === "off") {
        config.AUTO_REACT = "false";
        return await conn.sendMessage(from, { text: "Autoreact feature is now disabled." }, { quoted: m });
    } else {
        return await conn.sendMessage(from, { text: `*🫟 ᴇxᴀᴍᴘʟᴇ: ${prefix}auto-react ᴏɴ*` }, { quoted: m });
    }
});

cmd({
    pattern: "status-reply",
    alias: ["autostatusreply"],
    desc: "Enable or disable status-reply.",
    category: "settings",
    filename: __filename
},    
async (conn, m, { args, from, isOwner }) => {
    if (!isOwner) return await conn.sendMessage(from, { text: "*📛 ᴏɴʟʏ ᴛʜᴇ ᴏᴡɴᴇʀ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ!*" }, { quoted: m });

    const status = args[0]?.toLowerCase();
    if (status === "on") {
        config.AUTO_STATUS_REPLY = "true";
        return await conn.sendMessage(from, { text: "Status-reply feature is now enabled." }, { quoted: m });
    } else if (status === "off") {
        config.AUTO_STATUS_REPLY = "false";
        return await conn.sendMessage(from, { text: "Status-reply feature is now disabled." }, { quoted: m });
    } else {
        return await conn.sendMessage(from, { text: `*🫟 ᴇxᴀᴍᴘʟᴇ:  ${prefix}status-reply ᴏɴ*` }, { quoted: m });
    }
});

cmd({
  pattern: "antilink",
  alias: ["antilinks"],
  desc: "Enable or disable ANTI_LINK in groups",
  category: "group",
  react: "🚫",
  filename: __filename
}, async (conn, m, { args, from, isGroup, isAdmins, isBotAdmins }) => {
  try {
    if (!isGroup) return await conn.sendMessage(from, { text: 'This command can only be used in a group.' }, { quoted: m });
    if (!isBotAdmins) return await conn.sendMessage(from, { text: 'Bot must be an admin to use this command.' }, { quoted: m });
    if (!isAdmins) return await conn.sendMessage(from, { text: 'You must be an admin to use this command.' }, { quoted: m });

    if (args[0] === "on") {
      config.ANTI_LINK = "true";
      await conn.sendMessage(from, { text: "✅ ANTI_LINK has been enabled." }, { quoted: m });
    } else if (args[0] === "off") {
      config.ANTI_LINK = "false";
      await conn.sendMessage(from, { text: "❌ ANTI_LINK has been disabled." }, { quoted: m });
    } else {
      await conn.sendMessage(from, { text: `*Usage:* ${prefix}antilink on/off` }, { quoted: m });
    }
  } catch (e) {
    await conn.sendMessage(from, { text: `Error: ${e.message}` }, { quoted: m });
  }
});

cmd({
  pattern: "antilinkkick",
  alias: ["kicklink"],
  desc: "Enable or disable ANTI_LINK_KICK in groups",
  category: "group",
  react: "⚠️",
  filename: __filename
}, async (conn, m, { args, from, isGroup, isAdmins, isBotAdmins }) => {
  try {
    if (!isGroup) return await conn.sendMessage(from, { text: 'This command can only be used in a group.' }, { quoted: m });
    if (!isBotAdmins) return await conn.sendMessage(from, { text: 'Bot must be an admin to use this command.' }, { quoted: m });
    if (!isAdmins) return await conn.sendMessage(from, { text: 'You must be an admin to use this command.' }, { quoted: m });

    if (args[0] === "on") {
      config.ANTI_LINK_KICK = "true";
      await conn.sendMessage(from, { text: "✅ ANTI_LINK_KICK has been enabled." }, { quoted: m });
    } else if (args[0] === "off") {
      config.ANTI_LINK_KICK = "false";
      await conn.sendMessage(from, { text: "❌ ANTI_LINK_KICK has been disabled." }, { quoted: m });
    } else {
      await conn.sendMessage(from, { text: `*Usage:* ${prefix}antilinkkick on/off` }, { quoted: m });
    }
  } catch (e) {
    await conn.sendMessage(from, { text: `Error: ${e.message}` }, { quoted: m });
  }
});

cmd({
  pattern: "deletelink",
  alias: ["linksdelete"],
  desc: "Enable or disable DELETE_LINKS in groups",
  category: "group",
  react: "❌",
  filename: __filename
}, async (conn, m, { args, from, isGroup, isAdmins, isBotAdmins }) => {
  try {
    if (!isGroup) return await conn.sendMessage(from, { text: 'This command can only be used in a group.' }, { quoted: m });
    if (!isBotAdmins) return await conn.sendMessage(from, { text: 'Bot must be an admin to use this command.' }, { quoted: m });
    if (!isAdmins) return await conn.sendMessage(from, { text: 'You must be an admin to use this command.' }, { quoted: m });

    if (args[0] === "on") {
      config.DELETE_LINKS = "true";
      await conn.sendMessage(from, { text: "✅ DELETE_LINKS is now enabled." }, { quoted: m });
    } else if (args[0] === "off") {
      config.DELETE_LINKS = "false";
      await conn.sendMessage(from, { text: "❌ DELETE_LINKS is now disabled." }, { quoted: m });
    } else {
      await conn.sendMessage(from, { text: `*Usage:* ${prefix}deletelink on/off` }, { quoted: m });
    }
  } catch (e) {
    await conn.sendMessage(from, { text: `Error: ${e.message}` }, { quoted: m });
  }
});
