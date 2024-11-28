import { validateQuestionnaire, validateResponse } from '../validation';

describe('Validation Utilities', () => {
  describe('validateQuestionnaire', () => {
    it('should validate a valid questionnaire', () => {
      const validQuestionnaire = {
        title: 'Test Questionnaire',
        brands: [
          { name: 'Brand 1' },
          { name: 'Brand 2' }
        ]
      };

      const result = validateQuestionnaire(validQuestionnaire);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject empty title', () => {
      const questionnaire = {
        title: '',
        brands: [{ name: 'Brand 1' }, { name: 'Brand 2' }]
      };

      const result = validateQuestionnaire(questionnaire);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('title');
    });

    it('should reject insufficient brands', () => {
      const questionnaire = {
        title: 'Test',
        brands: [{ name: 'Brand 1' }]
      };

      const result = validateQuestionnaire(questionnaire);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('brands');
    });
  });

  describe('validateResponse', () => {
    it('should validate a valid response', () => {
      const validResponse = {
        answers: [
          { rating: 4, criterion: 'appearance' },
          { rating: 5, criterion: 'flavor' }
        ],
        comparativeEvaluation: {
          preferredBrand: 'brand-id'
        }
      };

      const result = validateResponse(validResponse);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject missing answers', () => {
      const response = {
        comparativeEvaluation: {
          preferredBrand: 'brand-id'
        }
      };

      const result = validateResponse(response);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('answers');
    });

    it('should reject invalid ratings', () => {
      const response = {
        answers: [
          { rating: 6, criterion: 'appearance' }
        ],
        comparativeEvaluation: {
          preferredBrand: 'brand-id'
        }
      };

      const result = validateResponse(response);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('answers');
    });

    it('should reject missing preferred brand', () => {
      const response = {
        answers: [
          { rating: 4, criterion: 'appearance' }
        ],
        comparativeEvaluation: {}
      };

      const result = validateResponse(response);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('preferredBrand');
    });
  });
}); 