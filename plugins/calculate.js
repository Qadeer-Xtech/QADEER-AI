const { cmd } = require('../command');

// Helper function to calculate factorial
const factorial = (n) => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = n; i > 1; i--) {
        result *= i;
    }
    return result;
};

cmd({
    pattern: "calculate",
    alias: ["calculator", "calc"],
    desc: "Evaluates a mathematical expression.",
    category: "tools",
    filename: __filename
},
async (conn, mek, m, { args, reply }) => {
    try {
        const expressionText = args.join(' ').trim();

        if (!expressionText) {
            return reply(`✳️ *Scientific Calculator* ✳️\n\n*Usage:* .calc <expression>\n*Example:* .calc (5+3)*sin(90)\n\n*Functions Available:*\n- Basic: +, -, *, /, ^\n- Logs: log(n), ln(n), log(n, base), antilog(n)\n- Trig: sin, cos, tan, asin, acos, atan\n- Other: √(n), n!, abs(n), round(n)`);
        }

        let expression = expressionText
            // General replacements
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**')
            // Special symbols and constants
            .replace(/√/g, 'Math.sqrt')
            .replace(/π|pi/gi, 'Math.PI')
            .replace(/e/gi, 'Math.E')
            
            // Handle custom base log first: log(number, base) -> Math.log(number)/Math.log(base)
            .replace(/log\s*\(([^,]+),([^)]+)\)/gi, '(Math.log($1)/Math.log($2))')
            
            // Now handle single-argument functions
            .replace(/antilog\(/gi, 'Math.pow(10,')
            .replace(/log\(/gi, 'Math.log10(') // Base 10 log
            .replace(/ln\(/gi, 'Math.log(')   // Natural log
            .replace(/sin\(/gi, 'Math.sin(')
            .replace(/cos\(/gi, 'Math.cos(')
            .replace(/tan\(/gi, 'Math.tan(')
            .replace(/asin\(/gi, 'Math.asin(')
            .replace(/acos\(/gi, 'Math.acos(')
            .replace(/atan\(/gi, 'Math.atan(')
            .replace(/abs\(/gi, 'Math.abs(')
            .replace(/round\(/gi, 'Math.round(')
            .replace(/ceil\(/gi, 'Math.ceil(')
            .replace(/floor\(/gi, 'Math.floor(');

        // Handle factorial '!' by pre-calculating it
        // Example: "5!" becomes "120"
        expression = expression.replace(/(\d+(\.\d+)?)!/g, (match, num) => factorial(parseFloat(num)));

        // Convert Degrees to Radians for trig functions (sin, cos, tan)
        expression = expression.replace(/Math\.(sin|cos|tan)\(([^)]+)\)/g, (match, func, val) => {
            return `Math.${func}((${val}) * Math.PI / 180)`;
        });

        // Convert Radians to Degrees for inverse trig functions (asin, acos, atan)
        expression = expression.replace(/Math\.(asin|acos|atan)\(([^)]+)\)/g, (match, func, val) => {
            return `(Math.${func}(${val}) * 180 / Math.PI)`;
        });

        let result;
        try {
            // Safely evaluate the final expression
            result = new Function('return ' + expression)();

            if (isNaN(result) || !isFinite(result)) {
                throw new Error("Invalid calculation resulted in NaN or Infinity");
            }
        } catch (e) {
            console.error("Calculation Error:", e);
            return reply(`❌ *Invalid Expression*\n\nPlease check your formula.\n*Examples:*\n.calc antilog(2) + 5!\n.calc log(100) + sin(90)\n.calc log(64,2)`);
        }

        // Reply with the result
        await reply(`*Expression:* \`${expressionText}\`\n\n*Result:* \`${result}\``);

    } catch (e) {
        console.error(e);
        await reply("❎ An unexpected error occurred while processing your request.");
    }
});
