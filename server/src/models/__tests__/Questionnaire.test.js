const mongoose = require('mongoose');
const Questionnaire = require('../Questionnaire');
const User = require('../User');

describe('Questionnaire Model', () => {
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__);
    testUser = await User.create({
      username: 'testadmin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin'
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Questionnaire.deleteMany({});
  });

  it('should create questionnaire with valid data', async () => {
    const questionnaireData = {
      title: 'Test Questionnaire',
      createdBy: testUser._id,
      brands: [
        { name: 'Brand 1' },
        { name: 'Brand 2' }
      ],
      status: 'open'
    };

    const questionnaire = await Questionnaire.create(questionnaireData);
    expect(questionnaire.title).toBe(questionnaireData.title);
    expect(questionnaire.brands).toHaveLength(2);
    expect(questionnaire.status).toBe('open');
  });

  it('should require minimum of two brands', async () => {
    const questionnaireData = {
      title: 'Test Questionnaire',
      createdBy: testUser._id,
      brands: [{ name: 'Brand 1' }],
      status: 'open'
    };

    let error;
    try {
      await Questionnaire.create(questionnaireData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.brands).toBeDefined();
  });

  it('should validate status enum values', async () => {
    const questionnaireData = {
      title: 'Test Questionnaire',
      createdBy: testUser._id,
      brands: [
        { name: 'Brand 1' },
        { name: 'Brand 2' }
      ],
      status: 'invalid-status'
    };

    let error;
    try {
      await Questionnaire.create(questionnaireData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.status).toBeDefined();
  });

  it('should set default status to open', async () => {
    const questionnaireData = {
      title: 'Test Questionnaire',
      createdBy: testUser._id,
      brands: [
        { name: 'Brand 1' },
        { name: 'Brand 2' }
      ]
    };

    const questionnaire = await Questionnaire.create(questionnaireData);
    expect(questionnaire.status).toBe('open');
  });

  it('should validate brand names', async () => {
    const questionnaireData = {
      title: 'Test Questionnaire',
      createdBy: testUser._id,
      brands: [
        { name: '' },
        { name: 'Brand 2' }
      ],
      status: 'open'
    };

    let error;
    try {
      await Questionnaire.create(questionnaireData);
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors['brands.0.name']).toBeDefined();
  });
}); 