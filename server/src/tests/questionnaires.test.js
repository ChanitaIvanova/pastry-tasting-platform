const request = require('supertest');
const app = require('../index');
const { createTestUser, generateTestToken } = require('./helpers/auth');

describe('Questionnaire API', () => {
  let adminUser, clientUser, adminToken, clientToken;

  beforeEach(async () => {
    adminUser = await createTestUser('admin');
    clientUser = await createTestUser('client');
    adminToken = generateTestToken(adminUser);
    clientToken = generateTestToken(clientUser);
  });

  describe('POST /api/questionnaires', () => {
    it('should create a questionnaire when admin is authenticated', async () => {
      const response = await request(app)
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Questionnaire',
          brands: [
            { name: 'Brand 1' },
            { name: 'Brand 2' }
          ],
          questions: [
            { criterion: 'appearance', description: 'Rate the appearance' }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('title', 'Test Questionnaire');
    });

    it('should reject creation when client tries to create', async () => {
      const response = await request(app)
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          title: 'Test Questionnaire',
          brands: [{ name: 'Brand 1' }]
        });

      expect(response.status).toBe(403);
    });
  });

  // Add more test cases...
}); 