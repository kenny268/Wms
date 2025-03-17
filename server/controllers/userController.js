require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User } = require('../models/User');
const { UserRole } = require('../models/UserRole');
const { Op } = require('sequelize');

// Helper function to generate JWT
const generateToken = (user) => {
    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY; // Fetch from the .env file
    return jwt.sign({ UserID: user.UserID, Username: user.Username }, JWT_SECRET_KEY, { expiresIn: '1h' });
  };

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get a user by ID
exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ where: { UserID: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Create a new user
exports.createUser = async (req, res) => {
  const { Username, FirstName, LastName, Email, password, CreatedByUserID, ModifiedByUserID, Phone, AddressID } = req.body;
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const newUser = await User.create({
            Username,
            FirstName,
            LastName,
            Email,
            password: hashedPassword,
            CreatedByUserID,
            ModifiedByUserID,
            Phone,
            AddressID,
        });

        const { UserID, Username:username } = newUser;

        // Generate a JWT token for the user
        const token = generateToken({ UserID, Username: username });

        // Set the token in an HTTP-only cookie (secure, httpOnly, SameSite for security)
        res.cookie('token', token, {
            httpOnly: true,  // Only accessible via HTTP(S), not JavaScript
            secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
            sameSite: 'Strict',  // Strict SameSite to mitigate CSRF attacks
            maxAge: 60 * 60 * 1000, // 1 hour expiry
            
        });

        // Respond with the new user details (you can customize this)
        res.status(201).json({ message: 'User created successfully', UserID, Username: username });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user' });
    }
};

// Login a user
exports.loginUser = async (req, res) => {
  const { Username, password } = req.body;
  try {
    const user = await User.findOne({ where: { Username } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // De-structure the user object
    const { UserID, Username: username } = user;

    // Generate a JWT token for the user
    const token = generateToken({ UserID, Username: username });

    // Set the token in an HTTP-only cookie (secure, httpOnly, SameSite for security)
    res.cookie('token', token, {
      httpOnly: true,  // Only accessible via HTTP(S), not JavaScript
      secure: process.env.NODE_ENV === 'production', // Only send cookie over HTTPS in production
      sameSite: 'Strict',  // Strict SameSite to mitigate CSRF attacks
      maxAge: 60 * 60 * 1000, // 1 hour expiry
    });

    // Respond with the user details (you can customize this)
    res.status(200).json({ message: 'Login successful', user });
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
}
};


// Update a user
exports.updateUser = async (req, res) => {
  const { userId } = req.params;
  const { FirstName, LastName, Email, password, Phone, AddressID } = req.body;
  try {
    const user = await User.findOne({ where: { UserID: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.FirstName = FirstName || user.FirstName;
    user.LastName = LastName || user.LastName;
    user.Email = Email || user.Email;
    user.password = password || user.password;
    user.Phone = Phone || user.Phone;
    user.AddressID = AddressID || user.AddressID;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

// Delete a user (soft delete)
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ where: { UserID: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.IsDeleted = true;
    await user.save();
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Add a role to a user
exports.addUserRole = async (req, res) => {
  const { userId, roleId } = req.body;
  try {
    const userRole = await UserRole.create({
      UserID: userId,
      RoleID: roleId,
    });
    res.status(201).json(userRole);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error adding user role' });
  }
};

// Remove a role from a user
exports.removeUserRole = async (req, res) => {
  const { userId, roleId } = req.params;
  try {
    const userRole = await UserRole.destroy({
      where: {
        UserID: userId,
        RoleID: roleId,
      },
    });
    if (!userRole) {
      return res.status(404).json({ message: 'Role not found for this user' });
    }
    res.status(200).json({ message: 'Role removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing user role' });
  }
};

// Get all roles for a user
exports.getUserRoles = async (req, res) => {
  const { userId } = req.params;
  try {
    const roles = await UserRole.findAll({
      where: { UserID: userId },
      include: [{ model: Role, as: 'Role' }], // Assuming 'Role' is your role model.
    });
    if (roles.length === 0) {
      return res.status(404).json({ message: 'No roles found for this user' });
    }
    res.status(200).json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching roles for user' });
  }
};
