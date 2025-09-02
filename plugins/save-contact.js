// save-contact.js
const config = require('../config');
const { cmd } = require('../command');
const { sleep } = require('../lib/functions');
const fs = require('fs').promises;

cmd({
    pattern: 'savecontact',
    alias: ['svcontact', 'vcf'],
    desc: 'Save and Export Group Contacts as VCF',
    category: 'group',
    use: '.savecontact',
    filename: __filename
}, async (client, message, m, { from, participants, groupMetadata, reply, isGroup, isPatron }) => {

    await client.sendMessage(m.key.remoteJid, { react: { text: '📤', key: m.key } });

    try {
        if (!isGroup) {
            return reply('❌ This command can only be used in groups.');
        }
        if (!isPatron) {
            return reply('❌ This command is only for the Owner.');
        }

        let seenNumbers = new Set();
        let contactsList = [];
        
        // Add owner's contacts first
        const ownerContacts = [
            { phoneNumber: '923151105391', name: 'Qadeer 🤖' },
            { phoneNumber: '923079749129', name: 'Qadeer 2' }
        ];

        // Process group participants
        for (let participant of participants) {
            if (!participant.phoneNumber) continue;

            let number = participant.phoneNumber.split('@')[0];
            if (!seenNumbers.has(number)) {
                seenNumbers.add(number);
                let contactName = participant.name || participant.pushName || '+' + number;
                contactsList.push({ name: `🤖 ${contactName}`, phoneNumber: number });
            }
        }

        // Add owner contacts if they are not already in the list
        for (let owner of ownerContacts) {
            if (!seenNumbers.has(owner.phoneNumber)) {
                seenNumbers.add(owner.phoneNumber);
                contactsList.push({ name: `🤖 ${owner.name}`, phoneNumber: owner.phoneNumber });
            }
        }

        let totalContacts = contactsList.length;
        if (totalContacts === 0) {
            return reply('❌ No contacts found.');
        }

        await reply(`*Saved ${totalContacts} contacts. Generating file...*`);

        // Create VCF content
        let vcfData = contactsList.map((contact, index) =>
            `BEGIN:VCARD\nVERSION:3.0\nFN:[${index + 1}] ${contact.name}\nTEL;type=CELL;type=VOICE;waid=${contact.phoneNumber}:${contact.phoneNumber}\nEND:VCARD`
        ).join('\n');
        
        const filePath = './QADEER-AI.vcf';
        await fs.writeFile(filePath, vcfData.trim(), 'utf8');
        
        await sleep(2000);

        // Send the VCF file as a document
        await client.sendMessage(from, {
            document: await fs.readFile(filePath),
            mimetype: 'text/vcard',
            fileName: 'QADEER-AI.vcf',
            caption: `GROUP: *${groupMetadata.subject}*\nMEMBERS: *${participants.length}*\nTOTAL CONTACTS: *${totalContacts}*`
        }, { quoted: message });

        // Clean up the created file
        await fs.unlink(filePath);

    } catch (error) {
        console.error('Error saving contacts:', error);
        reply('⚠️ Failed to save contacts. Please try again.');
    }
});
