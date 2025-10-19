import { formatQuestionnaireData } from '../export';
import * as XLSX from 'xlsx';

// Mock XLSX
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn()
  },
  writeFile: jest.fn()
}));

describe('Export Utilities', () => {
  const mockQuestionnaire = {
    title: 'Test Questionnaire',
    status: 'closed',
    brands: [
      { _id: 'brand1', name: 'Brand 1' },
      { _id: 'brand2', name: 'Brand 2' }
    ]
  };

  const mockStatistics = {
    totalResponses: 10,
    brandRatings: {
      brand1: {
        averageScore: 9,
        criteriaScores: {
          appearance: 8.4,
          flavor: 9.6
        }
      },
      brand2: {
        averageScore: 7.6,
        criteriaScores: {
          appearance: 7,
          flavor: 8.2
        }
      }
    },
    brandPreferences: {
      brand1: 6,
      brand2: 4
    }
  };

  it('should format questionnaire data correctly', () => {
    const formattedData = formatQuestionnaireData(mockQuestionnaire, mockStatistics);

    expect(formattedData[0]).toEqual({
      'Questionnaire Title': 'Test Questionnaire',
      'Total Responses': 10,
      'Status': 'closed'
    });

    // Check brand ratings
    const brandData = formattedData.filter(row => row.Brand);
    expect(brandData).toHaveLength(2);
    expect(brandData[0].Brand).toBe('Brand 1');
    expect(brandData[0]['Average Rating']).toBe(9);
    expect(brandData[0]['Times Preferred']).toBe(6);
  });

  it('should handle missing statistics', () => {
    const formattedData = formatQuestionnaireData(mockQuestionnaire, {
      totalResponses: 0,
      brandRatings: {},
      brandPreferences: {}
    });

    expect(formattedData[0].Status).toBe('closed');
    expect(formattedData[0]['Total Responses']).toBe(0);
  });
}); 