const request = require('supertest');
const app = require('../index');
const { createTestUser, generateTestToken } = require('./helpers/auth');
const Questionnaire = require('../models/Questionnaire');
const Response = require('../models/Response');

describe('Response API', () => {
  let clientUser, adminUser, clientToken, adminToken, testQuestionnaire;

  beforeEach(async () => {
    clientUser = await createTestUser('client');
    adminUser = await createTestUser('admin');
    clientToken = generateTestToken(clientUser);
    adminToken = generateTestToken(adminUser);

    testQuestionnaire = await Questionnaire.create({
      title: 'Test Questionnaire',
      createdBy: adminUser._id,
      brands: [
        { name: 'Brand 1' },
        { name: 'Brand 2' }
      ],
      questions: [
        { criterion: 'appearance', description: 'Rate appearance' },
        { criterion: 'flavor', description: 'Rate flavor' }
      ],
      status: 'open'
    });
  });

  describe('POST /api/responses/:questionnaireId', () => {
    it('should create a response for an open questionnaire', async () => {
      const responseData = {
        answers: [
          {
            brand: testQuestionnaire.brands[0]._id,
            criterion: 'appearance',
            rating: 4,
            comments: 'Good appearance'
          },
          {
            brand: testQuestionnaire.brands[0]._id,
            criterion: 'flavor',
            rating: 5,
            comments: 'Excellent flavor'
          }
        ],
        comparativeEvaluation: {
          preferredBrand: testQuestionnaire.brands[0]._id,
          comments: 'Overall good'
        }
      };

      const response = await request(app)
        .post(`/api/responses/${testQuestionnaire._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(responseData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('answers');
      expect(response.body.answers).toHaveLength(2);
    });

    it('should not allow submission for closed questionnaire', async () => {
      await Questionnaire.findByIdAndUpdate(testQuestionnaire._id, { status: 'closed' });

      const response = await request(app)
        .post(`/api/responses/${testQuestionnaire._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/responses/statistics/:questionnaireId', () => {
    beforeEach(async () => {
      // Create some test responses
      await Response.create({
        questionnaire: testQuestionnaire._id,
        user: clientUser._id,
        answers: [
          {
            brand: testQuestionnaire.brands[0]._id,
            criterion: 'appearance',
            rating: 4
          },
          {
            brand: testQuestionnaire.brands[0]._id,
            criterion: 'flavor',
            rating: 5
          }
        ],
        comparativeEvaluation: {
          preferredBrand: testQuestionnaire.brands[0]._id
        },
        isSubmitted: true
      });
    });

    it('should return statistics for admin users', async () => {
      const response = await request(app)
        .get(`/api/responses/statistics/${testQuestionnaire._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalResponses');
      expect(response.body).toHaveProperty('brandRatings');
      expect(response.body).toHaveProperty('brandPreferences');
    });

    it('should deny access to statistics for client users', async () => {
      const response = await request(app)
        .get(`/api/responses/statistics/${testQuestionnaire._id}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(403);
    });
  });
}); 