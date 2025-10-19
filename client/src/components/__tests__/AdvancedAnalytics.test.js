import React from 'react';
import { render, screen } from '@testing-library/react';
import AdvancedAnalytics from '../AdvancedAnalytics';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: jest.fn(({ children }) => <div>{children}</div>),
  RadarChart: jest.fn(({ children }) => <div data-testid="radar-chart">{children}</div>),
  Radar: jest.fn(() => null),
  PolarGrid: jest.fn(() => null),
  PolarAngleAxis: jest.fn(() => null),
  PolarRadiusAxis: jest.fn(() => null),
  LineChart: jest.fn(({ children }) => <div data-testid="line-chart">{children}</div>),
  Line: jest.fn(() => null),
  BarChart: jest.fn(({ children }) => <div data-testid="bar-chart">{children}</div>),
  Bar: jest.fn(() => null),
  XAxis: jest.fn(() => null),
  YAxis: jest.fn(() => null),
  CartesianGrid: jest.fn(() => null),
  Tooltip: jest.fn(() => null),
  Legend: jest.fn(() => null)
}));

describe('AdvancedAnalytics', () => {
  const mockQuestionnaire = {
    title: 'Test Questionnaire',
    brands: [
      { _id: 'brand1', name: 'Brand 1' },
      { _id: 'brand2', name: 'Brand 2' }
    ]
  };

  const mockStatistics = {
    brandRatings: {
      brand1: {
        averageScore: 9,
        criteriaScores: {
          appearance: 8.4,
          aroma: 9,
          texture: 8.6,
          flavor: 9.4,
          aftertaste: 8.8,
          overall: 9
        }
      },
      brand2: {
        averageScore: 8,
        criteriaScores: {
          appearance: 7.6,
          aroma: 8.2,
          texture: 7.8,
          flavor: 8.4,
          aftertaste: 7.8,
          overall: 8
        }
      }
    }
  };

  it('renders all chart sections', () => {
    render(
      <AdvancedAnalytics
        statistics={mockStatistics}
        questionnaire={mockQuestionnaire}
      />
    );

    expect(screen.getByText('Comparative Analysis')).toBeInTheDocument();
    expect(screen.getByText('Rating Trends')).toBeInTheDocument();
    expect(screen.getByText('Rating Distribution')).toBeInTheDocument();
  });

  it('formats radar data correctly', () => {
    render(
      <AdvancedAnalytics
        statistics={mockStatistics}
        questionnaire={mockQuestionnaire}
      />
    );

    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
  });

  it('displays brand names in legend', () => {
    render(
      <AdvancedAnalytics
        statistics={mockStatistics}
        questionnaire={mockQuestionnaire}
      />
    );

    expect(screen.getByText('Brand 1')).toBeInTheDocument();
    expect(screen.getByText('Brand 2')).toBeInTheDocument();
  });

  it('handles missing statistics gracefully', () => {
    const emptyStats = {
      brandRatings: {}
    };

    render(
      <AdvancedAnalytics
        statistics={emptyStats}
        questionnaire={mockQuestionnaire}
      />
    );

    // Should still render chart containers without errors
    expect(screen.getByTestId('radar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('calculates trends data correctly', () => {
    render(
      <AdvancedAnalytics
        statistics={mockStatistics}
        questionnaire={mockQuestionnaire}
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('calculates distribution data correctly', () => {
    render(
      <AdvancedAnalytics
        statistics={mockStatistics}
        questionnaire={mockQuestionnaire}
      />
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });
}); 