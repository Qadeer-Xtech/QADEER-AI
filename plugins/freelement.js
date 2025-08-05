const {
    ezra
} = require('../fr-dl/lib');

ezra({
    nomCom: "element",
    categorie: "📓",
    reaction: "Education"
}, async (bot, message, context) => {
    const {
        repondre,
        arg
    } = context;
    const elementQuery = arg.join(' ').toLowerCase();

    if (!elementQuery) {
        return repondre("Please provide an element name, symbol or atomic number to search.");
    }

    try {
        let response = await fetch(`https://api.popcat.xyz/periodic-table?element=${elementQuery}`);
        if (!response.ok) {
            return repondre("Could not find an element with that name, symbol or atomic number. Please try again.");
        }

        let data = await response.json();
        let replyText = `
*Element Information*
> *𝙿𝙾𝚆𝙴𝚁𝙴𝙳 𝙱𝚈 𝚀𝙰𝙳𝙴𝙴𝚁 𝙺𝙷𝙰𝙽*

🪄 *Name:* ${data.name}
🪄 *Symbol:* ${data.symbol}
🪄 *Atomic Number:* ${data.atomic_number}
🪄 *Atomic Mass:* ${data.atomic_mass}
🪄 *Period:* ${data.period}
🪄 *Phase:* ${data.phase}
🪄 *Discovered By:* ${data.discovered_by}
🪄 *Summary:* ${data.summary}
`;

        await repondre(replyText);
    } catch (error) {
        repondre("An error occurred while fetching the element information. Please try again later.");
    }
});
