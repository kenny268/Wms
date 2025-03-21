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

// Middleware for logging all requests
// Rate limiter for all requests
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: process.env.MAX_REQUESTS || 100, // Read max requests from .env
//     message: 'Too many requests from this IP, please try again after 15 minutes',
//     standardHeaders: true,
//     legacyHeaders: false,
// });
// app.use(limiter);


// CORS configuration
const corsOptions = {
    // origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000', // Read allowed origins from .env
    origin: '*', // Allow all origins temporarily
    credentials: true,
};

app.use(cors(corsOptions));

// Security headers with Helmet
app.use(helmet());


// Cookie parser middleware
app.use(cookieParser());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', allRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Server error:', err);
    res.status(500).json({ message: 'Something went wrong on the server.' });
});

// Database synchronization and server start
async function startServer() {
    try {
        await sequelize.sync({ force: false });
        logger.info('Database synchronized successfully.');

        app.listen(port,'0.0.0.0', () => {
            logger.info(`Server is running on port ${port}`);
        });
    } catch (error) {
        logger.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

startServer();