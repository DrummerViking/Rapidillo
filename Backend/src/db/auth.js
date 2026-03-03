// =============================================
// auth.js — Authentication logic (JWT)
// =============================================

require('dotenv').config();
const jwt = require('jsonwebtoken');
const {
  createUser,
  findUserByUsername,
  verifyPassword,
  updateLastLogin
} = require('./queries');

const JWT_SECRET  = process.env.JWT_SECRET;
const JWT_EXPIRES = '7d'; // Token valid for 7 days

// =============================================
// FUNCTION 1: Register a new user
// =============================================
async function register(username, email, password) {

  // Validate inputs
  if (!username || username.length < 3) {
    return { success: false, reason: 'Username must be at least 3 characters.' };
  }
  if (!email || !email.includes('@')) {
    return { success: false, reason: 'Invalid email address.' };
  }
  if (!password || password.length < 10) {
    return { success: false, reason: 'Password must be at least 10 characters.' };
  }

  // Check if username already exists
  const existing = await findUserByUsername(username);
  if (existing) {
    return { success: false, reason: 'Username already taken.' };
  }

  // Create the user
  const user = await createUser(username, email, password);

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  return { success: true, user, token };
}

// =============================================
// FUNCTION 2: Login
// =============================================
async function login(username, password) {

  // Find the user
  const user = await findUserByUsername(username);
  if (!user) {
    return { success: false, reason: 'Username or password incorrect.' };
  }

  // Verify the password
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return { success: false, reason: 'Username or password incorrect.' };
  }

  // Update last login
  await updateLastLogin(user.id);

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  return {
    success: true,
    user: {
      id:       user.id,
      username: user.username,
      email:    user.email,
    },
    token
  };
}

// =============================================
// FUNCTION 3: Verify a JWT token
// =============================================
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, userId: decoded.userId, username: decoded.username };
  } catch (err) {
    return { valid: false, reason: err.message };
  }
}

module.exports = { register, login, verifyToken };