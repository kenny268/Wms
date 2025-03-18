const { Role, UserRole } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const roleService = {
    async createRole(roleData) {
        try {
            const { RoleName, Description } = roleData;

            // Check for duplicate RoleName
            const existingRole = await Role.findOne({ where: { RoleName } });
            if (existingRole) {
                return { status: 409, message: 'Role with this name already exists.' };
            }

            const newRole = await Role.create({ RoleName, Description });
            logger.info(`Role created with ID: ${newRole.RoleID}`);
            return { status: 201, data: newRole };
        } catch (error) {
            logger.error(`Error creating role: ${error.message}`, { roleData });
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },

    async getAllRoles(filters, pagination) {
        try {
            const { roleName } = filters;
            const { page, limit } = pagination;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};

            if (roleName) {
                where.RoleName = { [Op.iLike]: `%${roleName}%` };
            }

            const { count, rows } = await Role.findAndCountAll({
                where,
                offset,
                limit,
                order: [['RoleName', 'ASC']],
            });

            return { status: 200, data: { count, rows } };
        } catch (error) {
            logger.error(`Error retrieving roles: ${error.message}`, { filters, pagination });
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },

    async getRoleById(id) {
        try {
            const role = await Role.findByPk(id);
            if (!role) {
                return { status: 404, message: `Role with ID ${id} not found.` };
            }
            return { status: 200, data: role };
        } catch (error) {
            logger.error(`Error retrieving role by ID: ${error.message}`, { id });
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },

    async updateRole(id, updateData) {
        try {
            const { RoleName } = updateData;

            // Check if the role exists
            const existingRoleById = await Role.findByPk(id);
            if (!existingRoleById) {
                return { status: 404, message: `Role with ID ${id} not found.` };
            }

            // Check for duplicate RoleName if updating the name
            if (RoleName && RoleName !== existingRoleById.RoleName) {
                const existingRoleByName = await Role.findOne({ where: { RoleName } });
                if (existingRoleByName) {
                    return { status: 409, message: 'Role with this name already exists.' };
                }
            }

            const [updatedRows] = await Role.update(updateData, {
                where: { RoleID: id },
            });

            if (updatedRows > 0) {
                logger.info(`Role with ID ${id} updated.`);
                const updatedRole = await Role.findByPk(id);
                return { status: 200, data: updatedRole };
            }
            return { status: 404, message: `Role with ID ${id} not found.` }; // Should ideally not reach here due to the initial check
        } catch (error) {
            logger.error(`Error updating role: ${error.message}`, { id, updateData });
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },

    async deleteRole(id) {
        try {
            // Check if the role exists
            const roleToDelete = await Role.findByPk(id);
            if (!roleToDelete) {
                return { status: 404, message: `Role with ID ${id} not found.` };
            }

            // Check for dependencies in UserRole
            const userRoleCount = await UserRole.count({ where: { RoleID: id } });
            if (userRoleCount > 0) {
                return { status: 409, message: 'Cannot delete role as it is assigned to one or more users.' };
            }

            const deletedRows = await Role.destroy({
                where: { RoleID: id },
            });

            if (deletedRows > 0) {
                logger.info(`Role with ID ${id} deleted.`);
                return { status: 204 };
            }
            return { status: 404, message: `Role with ID ${id} not found.` }; // Should ideally not reach here due to the initial check
        } catch (error) {
            logger.error(`Error deleting role: ${error.message}`, { id });
            return { status: 500, message: error.message || 'Internal Server Error' };
        }
    },
};

module.exports = roleService;