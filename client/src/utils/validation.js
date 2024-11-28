export const validateQuestionnaire = (data) => {
  const errors = {};

  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  }

  if (!data.brands?.length || data.brands.length < 2) {
    errors.brands = 'At least two brands are required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateResponse = (data) => {
  const errors = {};

  if (!data.answers?.length) {
    errors.answers = 'Ratings are required';
  } else if (data.status === 'submitted') {
    const hasInvalidRating = data.answers.some(
      answer => !answer.rating || answer.rating < 1 || answer.rating > 5
    );
    if (hasInvalidRating) {
      errors.answers = 'All ratings must be between 1 and 5';
    }
  }

  if (data.status === 'submitted' && !data.comparativeEvaluation?.preferredBrand) {
    errors.preferredBrand = 'Please select your preferred brand';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}; 