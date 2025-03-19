require('dotenv').config(); // Load environment variables from .env file
const { User, Role, UserRole } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// const config = require('../config/config'); // Remove this line
const logger = require('../utils/logger');

const userService = {
    async registerUser(userData) {
        try {
            const { Username, Password, Email, FirstName, LastName, RoleIDs } = userData;

            // Check for existing username
            const existingUsername = await User.findOne({ where: { Username } });
            if (existingUsername) {
                return { status: 409, message: 'Username already exists.' };
            }

            // Check for existing email
            const existingEmail = await User.findOne({ where: { Email } });
            if (existingEmail) {
                return { status: 409, message: 'Email already exists.' };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(Password, 10);

            // Create user
            const newUser = await User.create({
                Username,
                password: hashedPassword,
                Email,
                FirstName,
                LastName,
                CreatedByUserID: null, // Or fetch from context if available
                ModifiedByUserID: null, // Or fetch from context if available
            });

            if (RoleIDs && RoleIDs.length > 0) {
                // Verify that the provided RoleIDs exist
                const rolesExist = await Role.findAll({
                    where: { RoleID: RoleIDs },
                    attributes: ['RoleID'],
                });

                if (rolesExist.length !== RoleIDs.length) {
                    return { status: 400, message: 'One or more provided Role IDs are invalid.' };
                }

                // Assign roles to the user
                const userRoles = RoleIDs.map(RoleId => ({
                    UserID: newUser.UserID,
                    RoleID: RoleId,
                }));
                await UserRole.bulkCreate(userRoles);
                logger.info(`User ${newUser.UserID} registered with roles: ${RoleIDs.join(', ')}`);
            } else {
                return { status: 400, message: 'At least one Role ID is required for registration.' };
            }

            const userWithoutPassword = { ...newUser.get() };
            delete userWithoutPassword.password;

            return { status: 201, data: userWithoutPassword };

        } catch (error) {
            logger.error(`Error registering user: ${error.message}`, { userData });
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },

    async loginUser(loginData, res) {
        try {
            const { Username, Password } = loginData;

            // Find user by username
            const user = await User.findOne({ where: { Username } });
            if (!user) {
                return { status: 401, message: 'Invalid credentials.' };
            }

            // Verify password
            const passwordMatch = await bcrypt.compare(Password, user.password);
            if (!passwordMatch) {
                return { status: 401, message: 'Invalid credentials.' };
            }

            // Fetch user roles
            const roles = await Role.findAll({
                include: [{
                    model: User,
                    where: { UserID: user.UserID },
                    through: { attributes:[] } // Exclude UserRole attributes
                }],
                attributes: ['RoleName'],
            });
            const roleNames = roles.map(role => role.RoleName);

            // Generate JWT
            const token = jwt.sign(
                { UserId: user.UserID, Username: user.Username, Roles: roleNames },
                process.env.JWT_SECRET, // Use environment variable
                { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // Use environment variable with default
            );

            // Set HTTP cookie
            res.cookie('authToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Set to true in production over HTTPS
                sameSite: 'Strict',
                maxAge: parseInt(process.env.JWT_COOKIE_MAX_AGE) || 3600000, // Use environment variable with default and parse to int
            });

            logger.info(`User ${user.UserID} logged in.`);
            return { status: 200, message: 'Login successful.' };

        } catch (error) {
            logger.error(`Error logging in user: ${error.message}`, { loginData });
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },

    async getAllUsers(filters, pagination) {
        try {
            const { roleId } = filters;
            const { page, limit } = pagination;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};
            const include = [{
                model: Role,
                through: { attributes:[]},
                attributes: ['RoleID', 'RoleName'],
            }];

            if (roleId) {
                include.where = { RoleID: roleId };
            }

            const { count, rows } = await User.findAndCountAll({
                where,
                include,
                offset,
                limit,
                attributes: { exclude: ['password'] },
                order: [['Username', 'ASC']],
            });

            return { status: 200, data: { count, rows } };

        } catch (error) {
            logger.error(`Error retrieving all users: ${error.message}`, { filters, pagination });
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },

    async getUserById(id) {
        try {
            const user = await User.findByPk(id, {
                include: [{
                    model: Role,
                    through: { attributes:[]},
                    attributes: ['RoleID', 'RoleName'],
                }],
                attributes: { exclude: ['password'] },
            });

            if (!user) {
                return { status: 404, message: `User with ID ${id} not found.` };
            }

            return { status: 200, data: user };

        } catch (error) {
            logger.error(`Error retrieving user by ID: ${error.message}`, { id });
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },

    async updateUser(id, updateData) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                return { status: 404, message: `User with ID ${id} not found.` };
            }

            const { Password, RoleIDs, ...otherUpdates } = updateData;
            const updates = { ...otherUpdates };

            if (Password) {
                updates.password = await bcrypt.hash(Password, 10);
            }

            await User.update(updates, { where: { UserID: id } });
            logger.info(`User with ID ${id} updated.`);

            if (RoleIDs) {
                // Verify that the provided RoleIDs exist
                const rolesExist = await Role.findAll({
                    where: { RoleID: RoleIDs },
                    attributes: ['RoleID'],
                });

                if (rolesExist.length !== RoleIDs.length) {
                    return { status: 400, message: 'One or more provided Role IDs are invalid.' };
                }

                // Remove existing roles and assign new roles
                await UserRole.destroy({ where: { UserID: id } });
                const newUserRoles = RoleIDs.map(RoleId => ({
                    UserID: id,
                    RoleID: RoleId,
                }));
                await UserRole.bulkCreate(newUserRoles);
                logger.info(`User ${id} roles updated to: ${RoleIDs.join(', ')}`);
            }

            const updatedUser = await User.findByPk(id, {
                include: [{
                    model: Role,
                    through: { attributes:[]},
                    attributes: ['RoleID', 'RoleName'],
                }],
                attributes: { exclude: ['password'] },
            });

            return { status: 200, data: updatedUser };

        } catch (error) {
            logger.error(`Error updating user: ${error.message}`, { id, updateData });
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },

    async deleteUser(id) {
        try {
            const user = await User.findByPk(id);
            if (!user) {
                return { status: 404, message: `User with ID ${id} not found.` };
            }

            // Delete associated UserRole records
            await UserRole.destroy({ where: { UserID: id } });
            logger.info(`User roles for user ${id} deleted.`);

            // Delete the user
            await User.destroy({ where: { UserID: id } });
            logger.info(`User with ID ${id} deleted.`);

            return { status: 204 };

        } catch (error) {
            logger.error(`Error deleting user: ${error.message}`, { id });
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },
};

module.exports = userService;