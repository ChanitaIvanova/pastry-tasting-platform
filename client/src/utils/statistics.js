export const formatCriteriaData = (criterion, questionnaire, statistics) => {
  if (!statistics || !questionnaire) return [];
  
  return questionnaire.brands.map(brand => ({
    name: brand.name,
    rating: statistics.brandRatings[brand._id]?.criteriaScores[criterion]?.toFixed(2) || 0
  }));
};

export const calculateAverageRating = (answers) => {
  if (!answers || answers.length === 0) return 0;
  const sum = answers.reduce((acc, answer) => acc + answer.rating, 0);
  return (sum / answers.length).toFixed(2);
};

export const calculateCriterionAverage = (answers, criterion) => {
  const criterionAnswers = answers.filter(answer => answer.criterion === criterion);
  return calculateAverageRating(criterionAnswers);
};

export const calculateBrandAverage = (answers, brandId) => {
  const brandAnswers = answers.filter(answer => answer.brand.toString() === brandId.toString());
  return calculateAverageRating(brandAnswers);
};

export const formatPreferenceData = (brandPreferences, questionnaire) => {
  if (!brandPreferences || !questionnaire) return [];

  return Object.entries(brandPreferences).map(([brandId, count]) => {
    const brand = questionnaire.brands.find(b => b._id === brandId);
    return {
      name: brand?.name || 'Unknown',
      value: count
    };
  });
};

export const formatDistributionData = (brandRatings) => {
  const distribution = {};
  const distributionKeys = ['1-2', '3-4', '5-6', '7-8', '9-10'];

  Object.values(brandRatings).forEach(brandRating => {
    Object.entries(brandRating.criteriaScores).forEach(([criterion, score]) => {
      if (!distribution[criterion]) {
        distribution[criterion] = distributionKeys.reduce((acc, key) => ({
          ...acc,
          [key]: 0
        }), { name: criterion });
      }
      const bracketIndex = Math.max(0, Math.min(distributionKeys.length - 1, Math.floor((score - 1) / 2)));
      const key = distributionKeys[bracketIndex];
      distribution[criterion][key]++;
    });
  });
  return Object.values(distribution);
};