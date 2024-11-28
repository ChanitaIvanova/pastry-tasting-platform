const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');
const { createTestUser, generateTestToken } = require('../helpers/auth');
const Questionnaire = require('../../models/Questionnaire');
const Response = require('../../models/Response');

describe('Responses Routes', () => {
  let adminUser;
  let clientUser;
  let adminToken;
  let clientToken;
  let questionnaire;
  let response;

  beforeEach(async () => {
    // Create test users
    adminUser = await createTestUser('admin');
    clientUser = await createTestUser('client');
    adminToken = generateTestToken(adminUser);
    clientToken = generateTestToken(clientUser);

    // Create test questionnaire
    questionnaire = await Questionnaire.create({
      title: 'Test Questionnaire',
      brands: [
        { _id: new mongoose.Types.ObjectId(), name: 'Brand 1' },
        { _id: new mongoose.Types.ObjectId(), name: 'Brand 2' }
      ],
      createdBy: adminUser._id,
      status: 'open'
    });

    // Create test response
    response = await Response.create({
      questionnaire: questionnaire._id,
      user: clientUser._id,
      answers: [
        {
          brand: questionnaire.brands[0]._id,
          criterion: 'appearance',
          rating: 4,
          comments: 'Good appearance'
        },
        {
          brand: questionnaire.brands[0]._id,
          criterion: 'flavor',
          rating: 5,
          comments: 'Excellent flavor'
        },
        {
          brand: questionnaire.brands[1]._id,
          criterion: 'appearance',
          rating: 3,
          comments: 'Average appearance'
        },
        {
          brand: questionnaire.brands[1]._id,
          criterion: 'flavor',
          rating: 4,
          comments: 'Good flavor'
        }
      ],
      comparativeEvaluation: {
        preferredBrand: questionnaire.brands[0]._id,
        comments: 'Brand 1 is better overall'
      },
      isSubmitted: true
    });
  });

  describe('GET /statistics/:questionnaireId', () => {
    it('should return correct statistics format for admin', async () => {
      const res = await request(app)
        .get(`/api/responses/statistics/${questionnaire._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('totalResponses', 1);
      expect(res.body).toHaveProperty('criteriaAverages');
      expect(res.body).toHaveProperty('brandRatings');
      expect(res.body).toHaveProperty('brandPreferences');
    });

    it('should calculate brand ratings correctly', async () => {
      const res = await request(app)
        .get(`/api/responses/statistics/${questionnaire._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const brand1Id = questionnaire.brands[0]._id.toString();
      const brand1Ratings = res.body.brandRatings[brand1Id];

      expect(brand1Ratings).toBeDefined();
      expect(brand1Ratings.averageScore).toBe(4.5); // (4 + 5) / 2
      expect(brand1Ratings.criteriaScores).toHaveProperty('appearance', 4);
      expect(brand1Ratings.criteriaScores).toHaveProperty('flavor', 5);
    });

    it('should calculate brand preferences correctly', async () => {
      const res = await request(app)
        .get(`/api/responses/statistics/${questionnaire._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      const brand1Id = questionnaire.brands[0]._id.toString();
      expect(res.body.brandPreferences[brand1Id]).toBe(1);
    });

    it('should deny access to non-admin users', async () => {
      const res = await request(app)
        .get(`/api/responses/statistics/${questionnaire._id}`)
        .set('Authorization', `Bearer ${clientToken}`);

      expect(res.status).toBe(403);
    });

    it('should handle questionnaires with no responses', async () => {
      // Create a new questionnaire with no responses
      const emptyQuestionnaire = await Questionnaire.create({
        title: 'Empty Questionnaire',
        brands: [{ name: 'Brand 1' }],
        createdBy: adminUser._id,
        status: 'open'
      });

      const res = await request(app)
        .get(`/api/responses/statistics/${emptyQuestionnaire._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalResponses).toBe(0);
      expect(Object.keys(res.body.brandRatings)).toHaveLength(0);
      expect(Object.keys(res.body.brandPreferences)).toHaveLength(0);
    });

    it('should handle invalid questionnaire ID', async () => {
      const res = await request(app)
        .get('/api/responses/statistics/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(500);
    });
  });

  // Add other existing test cases for submissions, updates, etc.
}); 