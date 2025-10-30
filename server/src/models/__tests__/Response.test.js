const mongoose = require('mongoose');
const Response = require('../Response');
const User = require('../User');
const Questionnaire = require('../Questionnaire');

describe('Response Model', () => {
  let testUser, testQuestionnaire;

  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
    testUser = await User.create({
      username: 'testclient',
      email: 'client@test.com',
      password: 'password123',
      role: 'client'
    });

    testQuestionnaire = await Questionnaire.create({
      title: 'Test Questionnaire',
      createdBy: testUser._id,
      brands: [
        { name: 'Brand 1' },
        { name: 'Brand 2' }
      ],
      questions: [
        { criterion: 'appearance', description: 'Rate appearance', type: 'rating' },
        { criterion: 'flavor', description: 'Rate flavor', type: 'rating' }
      ]
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Response.deleteMany({});
  });

  it('should create response with valid data', async () => {
    const responseData = {
      questionnaire: testQuestionnaire._id,
      user: testUser._id,
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
      }
    };

    const response = await Response.create(responseData);
    expect(response.answers).toHaveLength(2);
    expect(response.status).toBe('draft');
  });

  it('should validate rating range', async () => {
    const responseData = {
      questionnaire: testQuestionnaire._id,
      user: testUser._id,
      answers: [
        {
          brand: testQuestionnaire.brands[0]._id,
          criterion: 'appearance',
          rating: 11,
          comments: 'Invalid rating'
        }
      ],
      comparativeEvaluation: {
        preferredBrand: testQuestionnaire.brands[0]._id
      }
    };

    let error;
    try {
      await Response.create(responseData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors['answers.0.rating']).toBeDefined();
  });

  it('should require preferred brand in comparative evaluation', async () => {
    const responseData = {
      questionnaire: testQuestionnaire._id,
      user: testUser._id,
      answers: [
        {
          brand: testQuestionnaire.brands[0]._id,
          criterion: 'appearance',
          rating: 8
        }
      ],
      comparativeEvaluation: {
        comments: 'Missing preferred brand'
      }
    };

    let error;
    try {
      await Response.create(responseData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors['comparativeEvaluation.preferredBrand']).toBeDefined();
  });

  it('should validate criterion enum values', async () => {
    const responseData = {
      questionnaire: testQuestionnaire._id,
      user: testUser._id,
      answers: [
        {
          brand: testQuestionnaire.brands[0]._id,
          criterion: 'invalid-criterion',
          rating: 8
        }
      ],
      comparativeEvaluation: {
        preferredBrand: testQuestionnaire.brands[0]._id
      }
    };

    let error;
    try {
      await Response.create(responseData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors['answers.0.criterion']).toBeDefined();
  });
}); 