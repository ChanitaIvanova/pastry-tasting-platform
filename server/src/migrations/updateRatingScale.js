const Migration = require('../models/Migration');
const Response = require('../models/Response');

const MIGRATION_NAME = '20240515-update-rating-scale-to-10';

async function applyRatingScaleMigration() {
  const existingMigration = await Migration.findOne({ name: MIGRATION_NAME });
  if (existingMigration) {
    return;
  }

  const responses = await Response.find({});

  for (const response of responses) {
    let hasUpdates = false;

    if (!Array.isArray(response.answers) || response.answers.length === 0) {
      continue;
    }

    response.answers.forEach(answer => {
      if (typeof answer.rating !== 'number') {
        return;
      }

      if (answer.rating >= 3) {
        const updatedRating = Math.min(answer.rating * 2, 10);
        if (updatedRating !== answer.rating) {
          answer.rating = updatedRating;
          hasUpdates = true;
        }
      }
    });

    if (hasUpdates) {
      response.markModified('answers');
      await response.save();
    }
  }

  await Migration.create({ name: MIGRATION_NAME });
}

module.exports = {
  name: MIGRATION_NAME,
  up: applyRatingScaleMigration,
};
