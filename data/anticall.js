const { DATABASE } = require('../lib/database');
const { DataTypes } = require('sequelize');
const config = require('../config');

const AntiCallDB = DATABASE.define('AntiCall', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        defaultValue: 1,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: config.ANTI_CALL === "true",
    },
}, {
    tableName: 'anticall',
    timestamps: false,
    hooks: {
        beforeCreate: record => { record.id = 1; },
        beforeBulkCreate: records => { records.forEach(record => { record.id = 1; }); },
    },
});

const AntiCallWarnDB = DATABASE.define('AntiCallWarns', {
    user: { type: DataTypes.STRING, primaryKey: true },
    warns: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
    tableName: 'anticall_warns',
    timestamps: false,
});

let isInitialized = false;

async function initializeAntiCallSettings() {
    if (isInitialized) return;
    try {
        await AntiCallDB.sync();
        await AntiCallWarnDB.sync();
        await AntiCallDB.findOrCreate({
            where: { id: 1 },
            defaults: { status: config.ANTI_CALL === "true" },
        });
        isInitialized = true;
    } catch (error) {
        console.error('Error initializing anti-call settings:', error);
        if (error.original && error.original.code === 'SQLITE_ERROR' && error.original.message.includes('no such table')) {
            await AntiCallDB.sync();
            await AntiCallWarnDB.sync();
            await AntiCallDB.create({ id: 1, status: config.ANTI_CALL === "true" });
            isInitialized = true;
        }
    }
}

async function setAntiCall(status) {
    await initializeAntiCallSettings();
    await AntiCallDB.update({ status }, { where: { id: 1 } });
}

async function getAntiCall() {
    await initializeAntiCallSettings();
    const record = await AntiCallDB.findByPk(1);
    return record ? record.status : config.ANTI_CALL === "true";
}

async function getWarns(user) {
    const record = await AntiCallWarnDB.findByPk(user);
    return record ? record.warns : 0;
}

async function addWarn(user) {
    const record = await AntiCallWarnDB.findByPk(user);
    if (record) {
        record.warns += 1;
        await record.save();
        return record.warns;
    } else {
        await AntiCallWarnDB.create({ user, warns: 1 });
        return 1;
    }
}

async function resetWarns(user) {
    await AntiCallWarnDB.destroy({ where: { user } });
}

module.exports = {
    AntiCallDB,
    initializeAntiCallSettings,
    setAntiCall,
    getAntiCall,
    getWarns,
    addWarn,
    resetWarns
};