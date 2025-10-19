const ratingScaleMigration = require('./updateRatingScale');

async function runMigrations() {
  await ratingScaleMigration.up();
}

module.exports = runMigrations;
module.exports.RATING_SCALE_MIGRATION = ratingScaleMigration.name;
