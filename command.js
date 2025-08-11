// command.js

// 'var' ki jagah 'const' ka istemal, jo modern practice hai.
const commands = [];

/**
 * Bot ke liye aik naya command register karta hai.
 * @param {object} info - Command ki maloomat (e.g., pattern, desc).
 * @param {function} func - Command ke chalne wala function.
 */
function cmd(info, func) {
    // YAHAN CHANGE KIYA GAYA HAI: Ab yeh error ko throw karega
    if (!info || typeof info.pattern !== 'string' || info.pattern.trim() === '') {
        // Pehle yahan console.error tha, ab throw hai
        throw new Error("Command is missing a valid 'pattern'.");
    }
    if (typeof func !== 'function') {
        // Pehle yahan console.error tha, ab throw hai
        throw new Error(`The command for pattern '${info.pattern}' does not have a valid function.`);
    }

    const data = {
        desc: '',
        fromMe: false,
        category: 'misc',
        dontAddCommandList: false,
        filename: "Not Provided",
        ...info, 
        function: func,
    };

    commands.push(data);
    return data;
}

module.exports = {
    cmd,
    AddCommand: cmd,
    commands,
};
