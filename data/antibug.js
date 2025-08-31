// data/antibug.js

const { DATABASE } = require('../lib/database');
const { DataTypes } = require('sequelize');
const config = require('../config');

const AntiBugDB = DATABASE.define('AntiBug', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        defaultValue: 1,
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: config.ANTI_BUG || false,
    },
}, {
    tableName: 'antibug',
    timestamps: false,
    hooks: {
        beforeCreate: record => { record.id = 1; },
        beforeBulkCreate: records => { records.forEach(record => { record.id = 1; }); },
    },
});

async function initializeAntiBugSettings() {
    try {
        await AntiBugDB.sync();
        await AntiBugDB.findOrCreate({
            where: { id: 1 },
            defaults: { status: config.ANTI_BUG || false },
        });
    } catch (error) {
        console.error('Error initializing anti-bug settings:', error);
    }
}

async function setAntiBug(status) {
    try {
        await initializeAntiBugSettings();
        const [affectedRows] = await AntiBugDB.update({ status }, { where: { id: 1 } });
        return affectedRows > 0;
    } catch (error) {
        console.error('Error setting anti-bug status:', error);
        return false;
    }
}

async function getAntiBug() {
    try {
        await initializeAntiBugSettings();
        const record = await AntiBugDB.findByPk(1);
        return record ? record.status : (config.ANTI_BUG || false);
    } catch (error) {
        console.error('Error getting anti-bug status:', error);
        return config.ANTI_BUG || false;
    }
}

// Initialize on first load
initializeAntiBugSettings();

module.exports = {
    AntiBugDB,
    initializeAntiBugSettings,
    setAntiBug,
    getAntiBug,
};