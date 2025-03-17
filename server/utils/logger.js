const winston = require('winston');
const path = require('path');
const { format } = require('winston');
const { combine, timestamp, printf, errors } = format;

// Custom format for logs
const logFormat = printf(({ level, message, timestamp, stack }) => {
    // If the log has a stack (for errors), we include it
    return stack
        ? `${timestamp} ${level}: ${message}\n${stack}`
        : `${timestamp} ${level}: ${message}`;
});

// Create the logger
const logger = winston.createLogger({
    level: 'info', // Set default log level
    format: combine(
        timestamp(),
        errors({ stack: true }), // To handle error stack traces properly
        logFormat // Custom log format
    ),
    transports: [
        // Console transport for development or debugging
        new winston.transports.Console({
            format: combine(
                winston.format.colorize(), // Adds colors to the log output
                timestamp(),
                logFormat
            ),
        }),

        // File transport for error logs
        new winston.transports.File({
            filename: path.join(__dirname, 'logs', 'error.log'),
            level: 'error', // Only logs error level and above
            maxsize: 10 * 1024 * 1024, // Max file size of 10 MB
            maxFiles: 5, // Keep up to 5 rotated log files
            tailable: true, // Ensures the most recent logs are accessible
        }),

        // File transport for combined logs (info, warn, debug, etc.)
        new winston.transports.File({
            filename: path.join(__dirname, 'logs', 'combined.log'),
            level: 'info', // Default logging level is info
            maxsize: 10 * 1024 * 1024, // Max file size of 10 MB
            maxFiles: 5, // Keep up to 5 rotated log files
            tailable: true,
        }),
    ],
});

// If we're in development environment, set the log level to debug
if (process.env.NODE_ENV === 'development') {
    logger.level = 'debug';
    // Add more console output if in dev environment
    logger.add(new winston.transports.Console({
        format: combine(
            winston.format.colorize(),
            timestamp(),
            logFormat
        ),
    }));
}

// A utility function to log HTTP requests with metadata (e.g., URL, method)
logger.httpRequest = function (req, res, next) {
    const start = Date.now();

    // Log the incoming request
    this.info(`Incoming request: ${req.method} ${req.url}`);

    // Log response after it's handled
    res.on('finish', () => {
        const duration = Date.now() - start;
        this.info(`Request completed: ${req.method} ${req.url} - ${res.statusCode} [${duration}ms]`);
    });

    next(); // Continue processing the request
};

// Add the logger to global scope to enable easy access (optional)
global.logger = logger;

module.exports = logger;
