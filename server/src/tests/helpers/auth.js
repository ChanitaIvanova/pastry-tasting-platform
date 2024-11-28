const jwt = require('jsonwebtoken');
const User = require('../../models/User');

const createTestUser = async (role = 'client') => {
  const user = new User({
    username: `test-${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    role
  });
  await user.save();
  return user;
};

const generateTestToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

module.exports = {
  createTestUser,
  generateTestToken
}; 