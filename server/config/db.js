// config/db.js
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: process.env.DB_DIALECT,
        port: process.env.DB_PORT,
        logging: false,
    }
);

sequelize.authenticate()
    .then(() => console.log('Connected to MySQL database'))
    .catch((err) => console.error('Unable to connect to database:', err));

module.exports = { sequelize, DataTypes }