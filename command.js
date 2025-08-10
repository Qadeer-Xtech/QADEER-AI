// command.js

// 'var' ki jagah 'const' ka istemal, jo modern practice hai.
const commands = [];

/**
 * Bot ke liye aik naya command register karta hai.
 * @param {object} info - Command ki maloomat (e.g., pattern, desc).
 * @param {function} func - Command ke chalne wala function.
 */
function cmd(info, func) {
    // FIX 1: Input ki Jaanch Partal (Validation)
    // Yeh check karta hai ke command mein zaroori cheezein hain ya nahi.
    if (!info || typeof info.pattern !== 'string' || info.pattern.trim() === '') {
        console.error("Error: Command is missing a valid 'pattern'.");
        return;
    }
    if (typeof func !== 'function') {
        console.error(`Error: The command for pattern '${info.pattern}' does not have a valid function.`);
        return;
    }

    // FIX 2: Original object ko tabdeel hone se bachana aur defaults set karna.
    // {...info} user ke diye gaye object ki COPY banata hai.
    const data = {
        desc: '',
        fromMe: false,
        category: 'misc',
        dontAddCommandList: false,
        filename: "Not Provided",
        ...info, // User ki di gayi maloomat yahan copy ho jayegi.
        function: func,
    };

    commands.push(data);
    return data;
}

// FIX 3: Exports ko saaf aur behtar banana.
module.exports = {
    cmd,
    AddCommand: cmd, // Compatibility ke liye rakha gaya hai
    commands,
};
