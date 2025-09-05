const { cmd } = require('../command');

cmd({
    pattern: "xvideos",
    alias: ["xvid", "xvideossearch"],
    desc: "Search for videos on Xvideos.",
    category: "bad",
    react: "😈",
    filename: __filename
},
async (conn, m, store, { from, reply, q, pushname, botname }) => {
    
    return reply(
`> *QADEER-AI🤖* is Muslim Bot......

🚫 Dear ${pushname}, Islam strictly forbids such content.
Please avoid these things and use your time in better ways.

📖 Allah says: *"Do not go near immorality, whether open or hidden."* (Quran 6:151)

💡 Tip: Stay productive, focus on halal knowledge, and remember death and the Hereafter.`
    );

});