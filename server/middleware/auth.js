// middleware/auth.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { UserRole, Role } = require('../models'); // Importing both models at once

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// Middleware to authenticate the JWT token
const authenticateToken = async (req, res, next) => {
    const token = req.cookies.token; // Get token from cookies

    if (!token) {
        return res.status(401).json({ message: 'Authentication required: No token provided' });
    }

    try {
        // Verify the token
        const userPayload = jwt.verify(token, JWT_SECRET_KEY);
        req.user = userPayload; // Attach the user payload to the request object
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Middleware to authorize user roles
const authorizeRole = (allowedRoles) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userId = req.user.UserID;

        try {
            const userRoles = await UserRole.findAll({
                where: { UserID: userId },
                include: [{ model: Role, as: 'Role' }],
            });

            const userHasRequiredRole = userRoles.some(userRole =>
                allowedRoles.includes(userRole.Role.RoleName)
            );

            if (userHasRequiredRole) {
                return next(); // User has the required role
            } else {
                return res.status(403).json({ message: 'Unauthorized: Insufficient role' });
            }
        } catch (error) {
            console.error('Error fetching user roles:', error);
            return res.status(500).json({ message: 'Error verifying user role' });
        }
    };
};

module.exports = { authenticateToken, authorizeRole };
