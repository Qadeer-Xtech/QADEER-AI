const { DATABASE } = require('../lib/database');
const { DataTypes } = require('sequelize');
const config = require('../config');

// This table will track call counts for each user
const AntiCallTracker = DATABASE.define('AntiCallTracker', {
    jid: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    call_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
    is_blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    last_call_timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'anticall_tracker',
    timestamps: false,
});

// This table will store the simple on/off status
const AntiCallSettings = DATABASE.define('AntiCallSettings', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: 1,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: config.ANTI_CALL === 'true',
    }
}, {
    tableName: 'anticall_settings',
    timestamps: false
});


async function initializeAntiCall() {
    await AntiCallTracker.sync();
    await AntiCallSettings.sync();
    const settings = await AntiCallSettings.findByPk(1);
    if (!settings) {
        await AntiCallSettings.create({ id: 1, status: config.ANTI_CALL === 'true' });
    }
}

// Get or create a user's record in the tracker
async function getCallRecord(jid) {
    await initializeAntiCall();
    const [record, created] = await AntiCallTracker.findOrCreate({
        where: { jid },
        defaults: { jid, call_count: 0 }
    });
    return record;
}

// Increment a user's call count
async function incrementCallCount(jid) {
    await AntiCallTracker.increment('call_count', { where: { jid } });
    await AntiCallTracker.update({ last_call_timestamp: new Date() }, { where: { jid } });
}

// Reset a user's call count
async function resetCallCount(jid) {
    await AntiCallTracker.update({ call_count: 0 }, { where: { jid } });
}

async function setBlockStatus(jid, status) {
    await AntiCallTracker.update({ is_blocked: status }, { where: { jid } });
}

async function getAntiCallStatus() {
    await initializeAntiCall();
    const settings = await AntiCallSettings.findByPk(1);
    return settings ? settings.status : (config.ANTI_CALL === 'true');
}

async function setAntiCallStatus(status) {
    await initializeAntiCall();
    await AntiCallSettings.update({ status }, { where: { id: 1 } });
}


module.exports = {
    getCallRecord,
    incrementCallCount,
    resetCallCount,
    setBlockStatus,
    getAntiCallStatus,
    setAntiCallStatus,
    initializeAntiCall
};