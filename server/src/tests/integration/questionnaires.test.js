const request = require('supertest');
const app = require('../../index');
const { createTestUser, generateTestToken } = require('../helpers/auth');
const Questionnaire = require('../../models/Questionnaire');

describe('Questionnaire Integration Tests', () => {
  let adminUser, clientUser, adminToken, clientToken;

  beforeEach(async () => {
    adminUser = await createTestUser('admin');
    clientUser = await createTestUser('client');
    adminToken = generateTestToken(adminUser);
    clientToken = generateTestToken(clientUser);
    await Questionnaire.deleteMany({});
  });

  describe('Questionnaire Creation', () => {
    const validQuestionnaire = {
      title: 'Integration Test Questionnaire',
      brands: [
        { name: 'Brand 1' },
        { name: 'Brand 2' }
      ]
    };

    it('should allow admin to create questionnaire', async () => {
      const response = await request(app)
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validQuestionnaire);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe(validQuestionnaire.title);
      expect(response.body.brands).toHaveLength(2);
      expect(response.body.status).toBe('open');
    });

    it('should prevent client from creating questionnaire', async () => {
      const response = await request(app)
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${clientToken}`)
        .send(validQuestionnaire);

      expect(response.status).toBe(403);
    });

    it('should validate questionnaire data', async () => {
      const invalidQuestionnaire = {
        title: '',
        brands: [{ name: 'Single Brand' }]
      };

      const response = await request(app)
        .post('/api/questionnaires')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidQuestionnaire);

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Questionnaire Management', () => {
    let testQuestionnaire;

    beforeEach(async () => {
      testQuestionnaire = await Questionnaire.create({
        title: 'Test Questionnaire',
        createdBy: adminUser._id,
        brands: [
          { name: 'Brand 1' },
          { name: 'Brand 2' }
        ]
      });
    });

    it('should allow admin to close questionnaire', async () => {
      const response = await request(app)
        .patch(`/api/questionnaires/${testQuestionnaire._id}/close`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('closed');
    });

    it('should prevent client from closing questionnaire', async () => {
      const response = await request(app)
        .patch(`/api/questionnaires/${testQuestionnaire._id}/close`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(403);
    });

    it('should list questionnaires with pagination', async () => {
      // Create additional questionnaires
      await Promise.all([
        Questionnaire.create({
          title: 'Test Questionnaire 2',
          createdBy: adminUser._id,
          brands: [{ name: 'Brand 1' }, { name: 'Brand 2' }]
        }),
        Questionnaire.create({
          title: 'Test Questionnaire 3',
          createdBy: adminUser._id,
          brands: [{ name: 'Brand 1' }, { name: 'Brand 2' }]
        })
      ]);

      const response = await request(app)
        .get('/api/questionnaires')
        .set('Authorization', `Bearer ${clientToken}`)
        .query({ page: 1, limit: 2 });

      expect(response.status).toBe(200);
      expect(response.body.questionnaires).toHaveLength(2);
      expect(response.body.total).toBe(3);
      expect(response.body.pages).toBe(2);
    });

    it('should filter questionnaires by status', async () => {
      await Questionnaire.findByIdAndUpdate(testQuestionnaire._id, { status: 'closed' });

      const response = await request(app)
        .get('/api/questionnaires')
        .set('Authorization', `Bearer ${clientToken}`)
        .query({ status: 'closed' });

      expect(response.status).toBe(200);
      expect(response.body.questionnaires).toHaveLength(1);
      expect(response.body.questionnaires[0].status).toBe('closed');
    });
  });

  describe('Questionnaire Statistics', () => {
    let testQuestionnaire;

    beforeEach(async () => {
      testQuestionnaire = await Questionnaire.create({
        title: 'Statistics Test',
        createdBy: adminUser._id,
        brands: [
          { name: 'Brand 1' },
          { name: 'Brand 2' }
        ]
      });
    });

    it('should provide statistics for admin', async () => {
      const response = await request(app)
        .get(`/api/questionnaires/${testQuestionnaire._id}/statistics`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalResponses');
      expect(response.body).toHaveProperty('brandRatings');
      expect(response.body).toHaveProperty('brandPreferences');
    });

    it('should prevent clients from accessing statistics', async () => {
      const response = await request(app)
        .get(`/api/questionnaires/${testQuestionnaire._id}/statistics`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(403);
    });
  });
}); 