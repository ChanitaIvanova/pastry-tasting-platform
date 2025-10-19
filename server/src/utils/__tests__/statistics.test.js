const { calculateStatistics } = require('../statistics');

describe('Statistics Utility', () => {
  const mockResponses = [
    {
      answers: [
        {
          brand: 'brand1',
          criterion: 'appearance',
          rating: 8,
          comments: 'Good'
        },
        {
          brand: 'brand1',
          criterion: 'flavor',
          rating: 10,
          comments: 'Excellent'
        },
        {
          brand: 'brand2',
          criterion: 'appearance',
          rating: 6,
          comments: 'Average'
        },
        {
          brand: 'brand2',
          criterion: 'flavor',
          rating: 8,
          comments: 'Good'
        }
      ],
      comparativeEvaluation: {
        preferredBrand: 'brand1',
        comments: 'Brand 1 was better'
      }
    },
    {
      answers: [
        {
          brand: 'brand1',
          criterion: 'appearance',
          rating: 10,
          comments: 'Perfect'
        },
        {
          brand: 'brand1',
          criterion: 'flavor',
          rating: 8,
          comments: 'Good'
        },
        {
          brand: 'brand2',
          criterion: 'appearance',
          rating: 8,
          comments: 'Good'
        },
        {
          brand: 'brand2',
          criterion: 'flavor',
          rating: 6,
          comments: 'Average'
        }
      ],
      comparativeEvaluation: {
        preferredBrand: 'brand1',
        comments: 'Preferred brand 1'
      }
    }
  ];

  it('calculates total responses correctly', () => {
    const stats = calculateStatistics(mockResponses);
    expect(stats.totalResponses).toBe(2);
  });

  it('calculates criteria averages correctly', () => {
    const stats = calculateStatistics(mockResponses);
    
    expect(stats.brandRatings.brand1.criteriaScores.appearance).toBe(9);
    expect(stats.brandRatings.brand1.criteriaScores.flavor).toBe(9);
    expect(stats.brandRatings.brand2.criteriaScores.appearance).toBe(7);
    expect(stats.brandRatings.brand2.criteriaScores.flavor).toBe(7);
  });

  it('calculates brand preferences correctly', () => {
    const stats = calculateStatistics(mockResponses);
    
    expect(stats.brandPreferences.brand1).toBe(2);
    expect(stats.brandPreferences.brand2).toBe(0);
  });

  it('calculates overall brand ratings correctly', () => {
    const stats = calculateStatistics(mockResponses);
    
    expect(stats.brandRatings.brand1.averageScore).toBe(9);
    expect(stats.brandRatings.brand2.averageScore).toBe(7);
  });

  it('handles empty responses array', () => {
    const stats = calculateStatistics([]);
    
    expect(stats.totalResponses).toBe(0);
    expect(stats.brandRatings).toEqual({});
    expect(stats.brandPreferences).toEqual({});
  });

  it('handles missing criteria in responses', () => {
    const incompleteResponses = [
      {
        answers: [
          {
            brand: 'brand1',
            criterion: 'appearance',
            rating: 8
          }
        ],
        comparativeEvaluation: {
          preferredBrand: 'brand1'
        }
      }
    ];

    const stats = calculateStatistics(incompleteResponses);
    expect(stats.brandRatings.brand1.criteriaScores.appearance).toBe(8);
    expect(stats.brandRatings.brand1.criteriaScores.flavor).toBeUndefined();
  });
}); 