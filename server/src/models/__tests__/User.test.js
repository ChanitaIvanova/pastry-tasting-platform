const mongoose = require('mongoose');
const User = require('../User');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should hash password before saving', async () => {
    const plainPassword = 'testPassword123';
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: plainPassword,
      role: 'client'
    });

    await user.save();
    expect(user.password).not.toBe(plainPassword);
    expect(await bcrypt.compare(plainPassword, user.password)).toBe(true);
  });

  it('should validate required fields', async () => {
    const user = new User({});
    let error;

    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.username).toBeDefined();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password).toBeDefined();
    expect(error.errors.role).toBeDefined();
  });

  it('should enforce unique email', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'client'
    };

    await User.create(userData);
    let error;

    try {
      await User.create(userData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000);
  });

  it('should validate email format', async () => {
    const user = new User({
      username: 'testuser',
      email: 'invalid-email',
      password: 'password123',
      role: 'client'
    });

    let error;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.email).toBeDefined();
  });

  it('should validate role enum values', async () => {
    const user = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'invalid-role'
    });

    let error;
    try {
      await user.save();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.role).toBeDefined();
  });

  it('should not rehash password if it was not modified', async () => {
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'client'
    });

    const originalPassword = user.password;
    user.username = 'newusername';
    await user.save();

    expect(user.password).toBe(originalPassword);
  });
}); 