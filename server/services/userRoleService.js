const { UserRole, User, Role } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const userRoleService = {
    async assignRoleToUser(assignmentData) {
        try {
            const { UserID, RoleID } = assignmentData;

            // Check if User and Role exist
            const user = await User.findByPk(UserID);
            if (!user) {
                return { status: 404, message: `User with ID ${UserID} not found.` };
            }
            const role = await Role.findByPk(RoleID);
            if (!role) {
                return { status: 404, message: `Role with ID ${RoleID} not found.` };
            }

            // Check if assignment already exists
            const existingAssignment = await UserRole.findOne({ where: { UserID, RoleID } });
            if (existingAssignment) {
                return { status: 409, message: `Role ${RoleID} is already assigned to user ${UserID}.` };
            }

            const newUserRole = await UserRole.create({ UserID, RoleID });
            logger.info(`Role ${RoleID} assigned to user ${UserID}`);
            return { status: 201, data: newUserRole };
        } catch (error) {
            logger.error(`Error assigning role to user: ${error.message}`, { assignmentData });
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },

    async getUserRoles(filters, pagination) {
        try {
            const { userId, roleId } = filters;
            const { page, limit } = pagination;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};

            if (userId) {
                where.UserID = userId;
            }
            if (roleId) {
                where.RoleID = roleId;
            }

            const { count, rows } = await UserRole.findAndCountAll({
                where,
                offset,
                limit,
                include: [
                    { model: User, attributes: ['UserID', 'Username', 'FirstName', 'LastName'] },
                    { model: Role, attributes: ['RoleID', 'RoleName', 'Description'] },
                ],
                order: [['UserRoleID', 'ASC']],
            });

            return { status: 200, data: { count, rows } };
        } catch (error) {
            logger.error(`Error retrieving user roles: ${error.message}`, { filters, pagination });
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },

    async removeRoleFromUser(assignmentData) {
        try {
            const { UserID, RoleID } = assignmentData;

            const deletedRows = await UserRole.destroy({
                where: { UserID, RoleID },
            });

            if (deletedRows > 0) {
                logger.info(`Role ${RoleID} removed from user ${UserID}`);
                return { status: 204 };
            } else {
                return { status: 404, message: `Assignment not found for User ID ${UserID} and Role ID ${RoleID}.` };
            }
        } catch (error) {
            logger.error(`Error removing role from user: ${error.message}`, { assignmentData });
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },

    async getRolesForUser(userId) {
        try {
            const user = await User.findByPk(userId, {
                include: [{
                    model: Role,
                    through: { attributes: [] }, // Exclude UserRole attributes from the result
                }],
            });

            if (!user) {
                return { status: 404, message: `User with ID ${userId} not found.` };
            }

            return { status: 200, data: user.Roles };
        } catch (error) {
            logger.error(`Error retrieving roles for user ${userId}: ${error.message}`);
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },
};

module.exports = userRoleService;