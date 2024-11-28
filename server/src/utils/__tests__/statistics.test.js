const { calculateStatistics } = require('../statistics');

describe('Statistics Utility', () => {
  const mockResponses = [
    {
      answers: [
        {
          brand: 'brand1',
          criterion: 'appearance',
          rating: 4,
          comments: 'Good'
        },
        {
          brand: 'brand1',
          criterion: 'flavor',
          rating: 5,
          comments: 'Excellent'
        },
        {
          brand: 'brand2',
          criterion: 'appearance',
          rating: 3,
          comments: 'Average'
        },
        {
          brand: 'brand2',
          criterion: 'flavor',
          rating: 4,
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
          rating: 5,
          comments: 'Perfect'
        },
        {
          brand: 'brand1',
          criterion: 'flavor',
          rating: 4,
          comments: 'Good'
        },
        {
          brand: 'brand2',
          criterion: 'appearance',
          rating: 4,
          comments: 'Good'
        },
        {
          brand: 'brand2',
          criterion: 'flavor',
          rating: 3,
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
    
    expect(stats.brandRatings.brand1.criteriaScores.appearance).toBe(4.5);
    expect(stats.brandRatings.brand1.criteriaScores.flavor).toBe(4.5);
    expect(stats.brandRatings.brand2.criteriaScores.appearance).toBe(3.5);
    expect(stats.brandRatings.brand2.criteriaScores.flavor).toBe(3.5);
  });

  it('calculates brand preferences correctly', () => {
    const stats = calculateStatistics(mockResponses);
    
    expect(stats.brandPreferences.brand1).toBe(2);
    expect(stats.brandPreferences.brand2).toBe(0);
  });

  it('calculates overall brand ratings correctly', () => {
    const stats = calculateStatistics(mockResponses);
    
    expect(stats.brandRatings.brand1.averageScore).toBe(4.5);
    expect(stats.brandRatings.brand2.averageScore).toBe(3.5);
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
            rating: 4
          }
        ],
        comparativeEvaluation: {
          preferredBrand: 'brand1'
        }
      }
    ];

    const stats = calculateStatistics(incompleteResponses);
    expect(stats.brandRatings.brand1.criteriaScores.appearance).toBe(4);
    expect(stats.brandRatings.brand1.criteriaScores.flavor).toBeUndefined();
  });
}); 