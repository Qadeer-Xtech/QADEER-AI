// Filename: lib/group-handler.js

// Yeh file group ke aam messages (non-commands) ko handle karne ke liye hai.
// Aap yahan apna custom group logic likh sakte hain.

module.exports = async (sock, m, message, context) => {
    try {
        // Context se zaroori variables nikal lein.
        const { from, sender, body } = context;

        // Agar message mein text nahi hai to kuch na karein.
        if (!body) return;
        
        // ===============================================
        // === YAHAN APNA CUSTOM GROUP LOGIC LIKHEIN ===
        // ===============================================
        
        // Yeh area aapke liye hai. Aap yahan group ke aam messages par
        // react karne ke liye apna code likh sakte hain.

        // Misaal ke taur par, jab koi 'test handler' likhe to bot jawab dega.
        if (body.toLowerCase() === 'test handler') {
            await sock.sendMessage(from, { text: '✅ Group handler is working!' }, { quoted: m });
        }
        

    } catch (e) {
        console.error("[Error in Simple Group Handler]", e);
    }
};
