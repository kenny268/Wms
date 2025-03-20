// server.js

require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

//custom imports
const { sequelize } = require('./config/db');
const allRoutes = require('./routes/index');


// const config = require('./config/config'); // No need for this if using .env for everything
const logger = require('./utils/logger');

const app = express();
const port = process.env.SERVER_PORT || 4000; // Read port from .env, default to 3000
app.use(morgan('combined', { stream: { write: (message) => logger.info(message) } }));
// Middleware

// Rate limiter for all requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.MAX_REQUESTS || 100, // Read max requests from .env
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);


app.use('/api', allRoutes);

// CORS configuration
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000', // Read allowed origins from .env
    credentials: true,
};
app.use(cors(corsOptions));

// Security headers with Helmet
app.use(helmet());

// Rate limiter (example for specific endpoints like login)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.LOGIN_MAX_ATTEMPTS || 100, // Read max login attempts from .env
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// Cookie parser middleware
app.use(cookieParser());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes


// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Server error:', err);
    res.status(500).json({ message: 'Something went wrong on the server.' });
});

// Database synchronization and server start
async function startServer() {
    try {
        // await sequelize.sync({ force: false });
        logger.info('Database synchronized successfully.');

        app.listen(port, () => {
            logger.info(`Server is running on port ${port}`);
        });
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

startServer();