export const validateQuestionnaire = (data) => {
  const errors = {};

  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  }

  if (!data.brands?.length || data.brands.length < 2) {
    errors.brands = 'At least two brands are required';
  }

  if (!data.questions?.length) {
    errors.questions = 'At least one question is required';
  } else {
    data.questions.forEach((question, index) => {
      if (!question.criterion?.trim()) {
        errors[`questions.${index}.criterion`] = 'Question criterion is required';
      }

      if (!question.description?.trim()) {
        errors[`questions.${index}.description`] = 'Question description is required';
      }

      const type = question.type || 'rating';

      if (type === 'single-select') {
        const options = (question.options || []).filter(option => option && option.trim());
        if (options.length === 0) {
          errors[`questions.${index}.options`] = 'Single select questions require at least one option';
        }
      }
    });
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
      answer => !answer.rating || answer.rating < 1 || answer.rating > 10
    );
    if (hasInvalidRating) {
      errors.answers = 'All ratings must be between 1 and 10';
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