const mongoose = require('mongoose');
const runMigrations = require('../../migrations');
const { RATING_SCALE_MIGRATION } = require('../../migrations');
const Response = require('../../models/Response');
const Questionnaire = require('../../models/Questionnaire');
const Migration = require('../../models/Migration');
const { createTestUser } = require('../helpers/auth');

describe('Database migrations', () => {
  let adminUser;
  let questionnaire;

  beforeEach(async () => {
    adminUser = await createTestUser('admin');
    questionnaire = await Questionnaire.create({
      title: 'Migration Test Questionnaire',
      createdBy: adminUser._id,
      brands: [
        { _id: new mongoose.Types.ObjectId(), name: 'Brand 1' },
        { _id: new mongoose.Types.ObjectId(), name: 'Brand 2' }
      ],
      questions: [
        { criterion: 'appearance', description: 'Rate appearance' }
      ],
    });
  });

  it('updates existing ratings to the 10-point scale and records migration run', async () => {
    const response = await Response.create({
      questionnaire: questionnaire._id,
      user: adminUser._id,
      status: 'submitted',
      comparativeEvaluation: {
        preferredBrand: questionnaire.brands[0]._id,
      },
      answers: [
        { brand: questionnaire.brands[0]._id, criterion: 'appearance', rating: 5 },
        { brand: questionnaire.brands[0]._id, criterion: 'appearance', rating: 4 },
        { brand: questionnaire.brands[0]._id, criterion: 'appearance', rating: 3 },
        { brand: questionnaire.brands[0]._id, criterion: 'appearance', rating: 2 },
        { brand: questionnaire.brands[0]._id, criterion: 'appearance', rating: 1 },
      ],
    });

    await runMigrations();

    const migratedResponse = await Response.findById(response._id);
    const migratedRatings = migratedResponse.answers.map(answer => answer.rating);

    expect(migratedRatings).toEqual([10, 8, 6, 2, 1]);

    const migrationRecord = await Migration.findOne({ name: RATING_SCALE_MIGRATION });
    expect(migrationRecord).toBeTruthy();
    expect(migrationRecord.runAt).toBeInstanceOf(Date);
  });

  it('does not alter ratings when run multiple times', async () => {
    const response = await Response.create({
      questionnaire: questionnaire._id,
      user: adminUser._id,
      status: 'submitted',
      comparativeEvaluation: {
        preferredBrand: questionnaire.brands[1]._id,
      },
      answers: [
        { brand: questionnaire.brands[1]._id, criterion: 'appearance', rating: 5 },
        { brand: questionnaire.brands[1]._id, criterion: 'appearance', rating: 3 },
      ],
    });

    await runMigrations();
    const firstRun = await Response.findById(response._id);
    const firstRatings = firstRun.answers.map(answer => answer.rating);

    await runMigrations();
    const secondRun = await Response.findById(response._id);
    const secondRatings = secondRun.answers.map(answer => answer.rating);

    expect(secondRatings).toEqual(firstRatings);

    const migrations = await Migration.find({ name: RATING_SCALE_MIGRATION });
    expect(migrations).toHaveLength(1);
  });
});
