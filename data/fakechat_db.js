const { DATABASE } = require('../lib/database');
const { DataTypes } = require('sequelize');
const config = require('../config'); // Step 1: Yeh line add ki gayi hai

const FakeChatDB = DATABASE.define('FakeChatSettings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        defaultValue: 1,
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'fakechat_settings',
    timestamps: false
});

async function initializeFakeChat() {
    await FakeChatDB.sync();
    const existing = await FakeChatDB.findByPk(1);
    if (!existing) {
        // Step 2: Yeh logic update kiya gaya hai
        // Ab yeh config se value check karega
        const initialStatus = config.FAKE_CHAT_ENABLED === 'true'; 
        await FakeChatDB.create({ id: 1, enabled: initialStatus });
    }
}

async function setFakeChatStatus(status) {
    await initializeFakeChat();
    await FakeChatDB.update({ enabled: status }, { where: { id: 1 } });
}

async function isFakeChatEnabled() {
    await initializeFakeChat();
    const setting = await FakeChatDB.findByPk(1);
    return setting ? setting.enabled : false;
}

module.exports = {
    initializeFakeChat,
    setFakeChatStatus,
    isFakeChatEnabled,
};
