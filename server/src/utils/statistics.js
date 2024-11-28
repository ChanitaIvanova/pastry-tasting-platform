const calculateStatistics = (responses) => {
  const statistics = {
    totalResponses: responses.length,
    criteriaAverages: {},
    brandRatings: {},
    brandPreferences: {}
  };

  responses.forEach(response => {
    // Calculate criteria averages
    response.answers.forEach(answer => {
      const brandId = answer.brand.toString();
      const criterion = answer.criterion;

      // Initialize brand ratings
      if (!statistics.brandRatings[brandId]) {
        statistics.brandRatings[brandId] = {
          totalScore: 0,
          count: 0,
          criteriaScores: {}
        };
      }

      // Initialize criteria scores for brand
      if (!statistics.brandRatings[brandId].criteriaScores[criterion]) {
        statistics.brandRatings[brandId].criteriaScores[criterion] = {
          sum: 0,
          count: 0
        };
      }

      // Update scores
      statistics.brandRatings[brandId].criteriaScores[criterion].sum += answer.rating;
      statistics.brandRatings[brandId].criteriaScores[criterion].count += 1;
      statistics.brandRatings[brandId].totalScore += answer.rating;
      statistics.brandRatings[brandId].count += 1;
    });

    // Count brand preferences
    const preferredBrand = response.comparativeEvaluation.preferredBrand.toString();
    statistics.brandPreferences[preferredBrand] = 
      (statistics.brandPreferences[preferredBrand] || 0) + 1;
  });

  // Calculate final averages
  Object.keys(statistics.brandRatings).forEach(brandId => {
    const brand = statistics.brandRatings[brandId];
    brand.averageScore = Number((brand.totalScore / brand.count).toFixed(2));

    Object.keys(brand.criteriaScores).forEach(criterion => {
      const scores = brand.criteriaScores[criterion];
      brand.criteriaScores[criterion] = Number((scores.sum / scores.count).toFixed(2));
    });
  });

  return statistics;
};

module.exports = {
  calculateStatistics
}; 