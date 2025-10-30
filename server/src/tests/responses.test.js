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
        { criterion: 'appearance', description: 'Rate appearance', type: 'rating' },
        { criterion: 'flavor', description: 'Rate flavor', type: 'rating' },
        {
          criterion: 'favoriteOccasion',
          description: 'When would you enjoy this pastry?',
          type: 'single-select',
          options: ['Breakfast', 'Dessert']
        },
        {
          criterion: 'additionalFeedback',
          description: 'Share any additional feedback',
          type: 'text'
        }
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
            rating: 8,
            comments: 'Good appearance'
          },
          {
            brand: testQuestionnaire.brands[0]._id,
            criterion: 'flavor',
            rating: 10,
            comments: 'Excellent flavor'
          }
        ],
        comparativeEvaluation: {
          preferredBrand: testQuestionnaire.brands[0]._id,
          comments: 'Overall good'
        },
        customAnswers: [
          {
            question: testQuestionnaire.questions[2]._id,
            value: 'Breakfast'
          },
          {
            question: testQuestionnaire.questions[3]._id,
            value: 'Great treat!'
          }
        ]
      };

      const response = await request(app)
        .post(`/api/responses/${testQuestionnaire._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(responseData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('answers');
      expect(response.body.answers).toHaveLength(2);
      expect(response.body.customAnswers).toHaveLength(2);
    });

    it('should reject invalid custom answers', async () => {
      const responseData = {
        answers: [
          {
            brand: testQuestionnaire.brands[0]._id,
            criterion: 'appearance',
            rating: 8
          },
          {
            brand: testQuestionnaire.brands[0]._id,
            criterion: 'flavor',
            rating: 9
          }
        ],
        comparativeEvaluation: {
          preferredBrand: testQuestionnaire.brands[0]._id
        },
        customAnswers: [
          {
            question: testQuestionnaire.questions[2]._id,
            value: 'Invalid option'
          }
        ]
      };

      const response = await request(app)
        .post(`/api/responses/${testQuestionnaire._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(responseData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should enforce max length for text answers', async () => {
      const longText = 'a'.repeat(501);
      const responseData = {
        answers: [
          {
            brand: testQuestionnaire.brands[0]._id,
            criterion: 'appearance',
            rating: 8
          },
          {
            brand: testQuestionnaire.brands[0]._id,
            criterion: 'flavor',
            rating: 9
          }
        ],
        comparativeEvaluation: {
          preferredBrand: testQuestionnaire.brands[0]._id
        },
        customAnswers: [
          {
            question: testQuestionnaire.questions[3]._id,
            value: longText
          }
        ]
      };

      const response = await request(app)
        .post(`/api/responses/${testQuestionnaire._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send(responseData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });

    it('should not allow submission for closed questionnaire', async () => {
      await Questionnaire.findByIdAndUpdate(testQuestionnaire._id, { status: 'closed' });

      const response = await request(app)
        .post(`/api/responses/${testQuestionnaire._id}`)
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          answers: [
            {
              brand: testQuestionnaire.brands[0]._id,
              criterion: 'appearance',
              rating: 8
            }
          ],
          comparativeEvaluation: {
            preferredBrand: testQuestionnaire.brands[0]._id
          }
        });

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
            rating: 8
          },
          {
            brand: testQuestionnaire.brands[0]._id,
            criterion: 'flavor',
            rating: 10
          }
        ],
        comparativeEvaluation: {
          preferredBrand: testQuestionnaire.brands[0]._id
        },
        status: 'submitted'
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