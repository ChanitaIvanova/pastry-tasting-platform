const request = require('supertest');
const app = require('../../index');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

describe('Authentication Integration Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('Registration Flow', () => {
    const validUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password123!',
      role: 'client'
    };

    it('should register new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe(validUser.email);
      expect(response.body.user.password).toBeUndefined();
      expect(response.body.token).toBeDefined();
    });

    it('should enforce password complexity', async () => {
      const weakPassword = { ...validUser, password: '123' };
      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPassword);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should prevent duplicate email registration', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(validUser);

      const response = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/already exists/i);
    });
  });

  describe('Login Flow', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123!',
          role: 'client'
        });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toMatch(/invalid credentials/i);
    });

    it('should return valid JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      const decoded = jwt.verify(
        response.body.token,
        process.env.JWT_SECRET || 'test-secret'
      );
      expect(decoded.userId).toBeDefined();
    });
  });

  describe('Token Validation', () => {
    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/questionnaires')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should reject requests with expired token', async () => {
      const expiredToken = jwt.sign(
        { userId: 'user123' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .get('/api/questionnaires')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });
  });
}); 