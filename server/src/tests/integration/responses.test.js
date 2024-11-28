const request = require('supertest');
const app = require('../../index');
const { createTestUser, generateTestToken } = require('../helpers/auth');
const Questionnaire = require('../../models/Questionnaire');
const Response = require('../../models/Response');

describe('Response Integration Tests', () => {
  let adminUser, clientUser, adminToken, clientToken, testQuestionnaire;

  beforeEach(async () => {
    adminUser = await createTestUser('admin');
    clientUser = await createTestUser('client');
    adminToken = generateTestToken(adminUser);
    clientToken = generateTestToken(clientUser);

    testQuestionnaire = await Questionnaire.create({
      title: 'Integration Test Questionnaire',
      createdBy: adminUser._id,
      brands: [
        { name: 'Test Brand 1' },
        { name: 'Test Brand 2' }
      ],
      status: 'open'
    });
  });

  describe('Response Submission Flow', () => {
    it('should allow complete response submission', async () => {
      const responseData = {
        answers: testQuestionnaire.brands.map(brand => ({
          brand: brand._id,
          criterion: 'appearance',
          rating: 4,
          comments: `Good appearance for ${brand.name}`
        })),
        comparativeEvaluation: {
          preferredBrand: testQuestionnaire.brands[0]._id,
          comments: 'Overall preference notes'
        }
      };

      const response = await request(app)
        .post(`/api/responses/${testQuestionnaire._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(responseData);

      expect(response.status).toBe(201);
      expect(response.body.answers).toHaveLength(2);
    });

    it('should prevent duplicate submissions from same user', async () => {
      const responseData = {
        answers: [
          {
            brand: testQuestionnaire.brands[0]._id,
            criterion: 'appearance',
            rating: 4
          }
        ],
        comparativeEvaluation: {
          preferredBrand: testQuestionnaire.brands[0]._id
        }
      };

      await Response.create({
        ...responseData,
        questionnaire: testQuestionnaire._id,
        user: clientUser._id
      });

      const response = await request(app)
        .post(`/api/responses/${testQuestionnaire._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(responseData);

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/already submitted/i);
    });

    it('should prevent submissions for closed questionnaires', async () => {
      await Questionnaire.findByIdAndUpdate(testQuestionnaire._id, { status: 'closed' });

      const response = await request(app)
        .post(`/api/responses/${testQuestionnaire._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toMatch(/closed/i);
    });
  });

  describe('Response Retrieval', () => {
    beforeEach(async () => {
      await Response.create({
        questionnaire: testQuestionnaire._id,
        user: clientUser._id,
        answers: [
          {
            brand: testQuestionnaire.brands[0]._id,
            criterion: 'appearance',
            rating: 4
          }
        ],
        comparativeEvaluation: {
          preferredBrand: testQuestionnaire.brands[0]._id
        }
      });
    });

    it('should allow users to view their own responses', async () => {
      const response = await request(app)
        .get('/api/responses/my-responses')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    it('should allow admins to view all responses', async () => {
      const response = await request(app)
        .get(`/api/responses/questionnaire/${testQuestionnaire._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
    });
  });
}); 