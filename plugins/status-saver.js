const { cmd } = require("../command");

cmd({
  pattern: "send",
  alias: ["sendme", 'save'],
  react: '📤',
  desc: "Forwards a quoted message back to the user.",
  category: "utility",
  filename: __filename,
}, async (conn, m, { from }) => { // Standard parameters
  try {
    if (!m.quoted) {
      return await conn.sendMessage(from, {
        text: "*🍁 Please reply to a message to forward it!*"
      }, { quoted: m });
    }

    // Quoted message ka media download karein
    const buffer = await m.quoted.download();
    const mtype = m.quoted.mtype;

    let messageContent = {};

    // Message type ke hisab se content tayyar karein
    switch (mtype) {
      case "imageMessage":
        messageContent = {
          image: buffer,
          caption: m.quoted.text || '',
          mimetype: m.quoted.mimetype || "image/jpeg"
        };
        break;
      case "videoMessage":
        messageContent = {
          video: buffer,
          caption: m.quoted.text || '',
          mimetype: m.quoted.mimetype || "video/mp4"
        };
        break;
      case "audioMessage":
        messageContent = {
          audio: buffer,
          mimetype: "audio/mp4",
          ptt: m.quoted.ptt || false
        };
        break;
      default:
        // Text messages ya doosre types ke liye
        if (m.quoted.text) {
             messageContent = { text: m.quoted.text };
        } else {
             return await conn.sendMessage(from, {
               text: "❌ Only image, video, audio, and text messages can be forwarded."
             }, { quoted: m });
        }
    }

    // Forwarded message ko usi chat mein wapas bhejain
    await conn.sendMessage(from, messageContent, { quoted: m });

  } catch (error) {
    console.error("Send Command Error:", error);
    await conn.sendMessage(from, {
      text: "❌ An error occurred while forwarding the message:\n" + error.message
    }, { quoted: m });
  }
});
