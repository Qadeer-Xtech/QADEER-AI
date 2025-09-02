const Sequelize = require('sequelize');

/**
 * Manages the database connection using a Singleton pattern to ensure a single instance.
 */
class DatabaseManager {
    // The single, static instance of the database connection.
    static instance = null;

    /**
     * Gets the singleton instance of the Sequelize database connection.
     * If an instance doesn't exist, it creates one.
     * @returns {Sequelize} The Sequelize instance.
     */
    static getInstance() {
        if (!DatabaseManager.instance) {
            // Use DATABASE_URL from environment variables, or default to a local SQLite file.
            const databaseUrl = process.env.DATABASE_URL || './database.db';

            // Check if using the default SQLite path or a PostgreSQL URL.
            if (databaseUrl === './database.db') {
                // --- Initialize SQLite Database ---
                DatabaseManager.instance = new Sequelize({
                    dialect: 'sqlite',
                    storage: databaseUrl,
                    logging: false // Disable logging of SQL queries
                });
            } else {
                // --- Initialize PostgreSQL Database ---
                DatabaseManager.instance = new Sequelize(databaseUrl, {
                    dialect: 'postgres',
                    protocol: 'postgres',
                    dialectOptions: {
                        ssl: {
                            require: true,
                            rejectUnauthorized: false // Necessary for some cloud providers like Heroku
                        }
                    },
                    logging: false // Disable logging of SQL queries
                });
            }
        }
        return DatabaseManager.instance;
    }
}

// Get the single instance of the database.
const DATABASE = DatabaseManager.getInstance();

// Synchronize all defined models with the database.
DATABASE.sync()
    .then(() => {
        console.log('Database synchronized successfully.');
    })
    .catch(error => {
        console.error('Error synchronizing the database:', error);
    });

// Export the database instance for use in other parts of the application.
module.exports = {
    DATABASE
};
