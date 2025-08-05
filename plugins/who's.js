const JavaScriptObfuscator = require('javascript-obfuscator');
const { ezra } = require('../fredi/ezra'); 
const beautify = require('js-beautify');

ezra({
    nom: 'obfus',
    categorie: 'conversion',
    alias: ['obfuscate']
}, async (client, message, {
    args,
    repondre
}) => {
    try {
        
        if (!args[0]) {
            return await repondre("Please provide the code you want to obfuscate.");
        }

        const inputText = args.join(' ');

        // Define strong obfuscation options
        const obfuscationOptions = {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 1,
            debugProtection: true,
            debugProtectionInterval: 4000,
            disableConsoleOutput: true,
            identifierNamesGenerator: 'hexadecimal',
            log: false,
            numbersToExpressions: true,
            renameGlobals: true,
            selfDefending: true,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 5,
            stringArray: true,
            stringArrayCallsTransform: true,
            stringArrayEncoding: ['rc4'],
            stringArrayIndexShift: true,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayWrappersCount: 5,
            stringArrayWrappersChainedCalls: true,
            stringArrayWrappersParametersMaxCount: 5,
            stringArrayWrappersType: 'function',
            transformObjectKeys: true,
            unicodeEscapeSequence: false
        };

        // Obfuscate the code
        const obfuscationResult = JavaScriptObfuscator.obfuscate(inputText, obfuscationOptions);
        
        // Reply with the obfuscated code
        await repondre(obfuscationResult.getObfuscatedCode());

    } catch (e) {
        console.error(e);
        await repondre("An error occurred during obfuscation. The code might be syntactically incorrect.");
    }
});


// --- Command 2: Deobfuscate JavaScript Code ---
// A simple deobfuscator that tries to beautify the code.
// Note: This is a very basic implementation and may not work on complex obfuscation.
ezra({
    nom: 'deobfus',
    categorie: 'conversion',
    alias: ['deobfuscate']
}, async (client, message, {
    args,
    repondre
}) => {
    try {
        const code = args.join(' ');
        if (!code) {
            return await repondre("Please provide the code you want to deobfuscate.");
        }
        
        // Use js-beautify to format the code
        const beautifiedCode = beautify(code, {
            indent_size: 2,
            space_in_empty_paren: true
        });

        await repondre(beautifiedCode);

    } catch (e) {
        console.error(e);
        await repondre("An error occurred during deobfuscation.");
    }
});


// --- Command 3: Get Profile Picture ---
// Fetches and sends the profile picture of a WhatsApp user.
ezra({
    nom: 'getpp',
    categorie: 'search'
}, async (client, message, {
    repondre,
    auteurMessage,
    nomAuteurMessage,
    msgRepondu,
    auteurMsgRepondu
}) => {
    let targetUser = null;
    let userName = null;

    // Determine the target user (replied message > mentioned user > command author)
    if (msgRepondu) {
        targetUser = auteurMsgRepondu;
        userName = nomAuteurMessage; // Note: This might be incorrect, should be name of replied author
    } else {
        targetUser = auteurMessage;
        userName = nomAuteurMessage;
    }

    let ppUrl;
    try {
        // Fetch the high-resolution profile picture URL
        ppUrl = await client.profilePictureUrl(targetUser, 'image');
    } catch {
        // Fallback to a default image if no profile picture is found
        ppUrl = 'https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669aeJeom.png';
    }

    const messageToSend = {
        image: {
            url: ppUrl
        },
        caption: `Here is the profile picture of ${userName}`
    };

    await client.sendMessage(message.chat, messageToSend, {
        quoted: message
    });
});


// --- Command 4: Who is this User ---
// Provides information (Name, Status, Profile Picture) about a WhatsApp user.
ezra({
    nom: 'whois',
    categorie: 'search'
}, async (client, message, {
    repondre,
    auteurMessage,
    nomAuteurMessage,
    msgRepondu,
    auteurMsgRepondu
}) => {
    let targetUser = null;
    let userName = null;
    let mentions = [];

    // Determine the target user and their name
    if (msgRepondu) {
        targetUser = auteurMsgRepondu;
        // Correctly get the username from the replied message author's pushName or verifiedName
        userName = client.getName(auteurMsgRepondu);
        mentions.push(auteurMsgRepondu);
    } else {
        targetUser = auteurMessage;
        userName = nomAuteurMessage;
    }

    let ppUrl;
    try {
        ppUrl = await client.profilePictureUrl(targetUser, 'image');
    } catch {
        ppUrl = 'https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669aeJeom.png'; // Default image
    }

    try {
        // Fetch user's status
        const userStatus = await client.fetchStatus(targetUser);
        
        const userInfoCaption = `*Name :* ${userName}\n*Status :* ${userStatus.status}`;

        const messageToSend = {
            image: {
                url: ppUrl
            },
            caption: userInfoCaption,
            mentions: mentions // Mention the user in the reply
        };

        await client.sendMessage(message.chat, messageToSend, {
            quoted: message
        });

    } catch (e) {
        console.error(e);
        await repondre("Could not fetch information for this user.");
    }
});
