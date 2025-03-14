const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize( process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    pool: {
        max: 5,      // Maximum number of connections in pool
        min: 0,      // Minimum number of connections in pool
        acquire: 30000, // Maximum time (ms) a connection can be idle before being released
        idle: 10000  // Maximum time (ms) Sequelize will wait for a connection
    },
    dialectOptions: {
        connectTimeout: 60000,
    }
});



module.exports = sequelize;