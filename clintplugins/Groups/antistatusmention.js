const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
    };

    try {
      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("Database is fucked, no settings found. Fix it, loser.") },
          { quoted: m }
        );
      }

      const value = args.join(" ").toLowerCase();
      const validModes = ["off", "delete", "remove"];

      if (validModes.includes(value)) {
        const currentMode = String(settings.antistatusmention || "off").toLowerCase();
        if (currentMode === value) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`AntiStatusMention is already '${value.toUpperCase()}', dumbass. Stop wasting my time. 😈`) },
            { quoted: m }
          );
        }

        await updateSetting('antistatusmention', value);
        
        let actionMessage = "";
        if (value === "off") actionMessage = "No more policing status mentions, you anarchist! 😴";
        if (value === "delete") actionMessage = "Status mentions will be deleted with warning! 🗑️";
        if (value === "remove") actionMessage = "Status mentions = Instant removal! Say goodbye! 🚫";
        
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`AntiStatusMention set to '${value.toUpperCase()}'! 🔥 ${actionMessage}`) },
          { quoted: m }
        );
      }

      const currentStatus = String(settings.antistatusmention || "off").toLowerCase();

      const buttons = [
        { buttonId: `${prefix}antistatusmention delete`, buttonText: { displayText: "DELETE 🗑️" }, type: 1 },
        { buttonId: `${prefix}antistatusmention remove`, buttonText: { displayText: "REMOVE 🚫" }, type: 1 },
        { buttonId: `${prefix}antistatusmention off`, buttonText: { displayText: "OFF 😴" }, type: 1 },
      ];

      const emoji =
        currentStatus === "delete" ? "🗑️" :
        currentStatus === "remove" ? "🚫" :
        "😴";

      const statusText =
        currentStatus === "delete" ? "DELETE (Delete with warning)" :
        currentStatus === "remove" ? "REMOVE (Delete & kick)" :
        "OFF (Disabled)";

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(`AntiStatusMention: ${statusText} ${emoji}\n\nPick your vibe, noob! 😈`),
          footer: "> 𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m }
      );
    } catch (error) {
      console.error("Error in AntiStatusMention command:", error);
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Shit broke, couldn't mess with antistatusmention. Database or something's fucked. Try later.") },
        { quoted: m }
      );
    }
  });
};