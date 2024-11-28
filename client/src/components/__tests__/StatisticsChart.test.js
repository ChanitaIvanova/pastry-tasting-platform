import React from 'react';
import { render, screen } from '@testing-library/react';
import StatisticsChart from '../StatisticsChart';
import { ResponsiveContainer } from 'recharts';

// Mock Recharts components
jest.mock('recharts', () => ({
  ResponsiveContainer: jest.fn(({ children }) => <div>{children}</div>),
  BarChart: jest.fn(({ children }) => <div data-testid="bar-chart">{children}</div>),
  Bar: jest.fn(() => null),
  XAxis: jest.fn(() => null),
  YAxis: jest.fn(() => null),
  CartesianGrid: jest.fn(() => null),
  Tooltip: jest.fn(() => null),
  Legend: jest.fn(() => null)
}));

describe('StatisticsChart', () => {
  const mockData = [
    { name: 'Appearance', rating: 4.5 },
    { name: 'Flavor', rating: 4.2 },
    { name: 'Texture', rating: 3.8 }
  ];

  it('renders chart title correctly', () => {
    render(<StatisticsChart data={mockData} title="Test Chart" />);
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('renders chart with correct data', () => {
    render(<StatisticsChart data={mockData} title="Test Chart" />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('maintains correct height ratio', () => {
    render(<StatisticsChart data={mockData} title="Test Chart" />);
    const container = screen.getByTestId('bar-chart').parentElement;
    expect(container).toHaveStyle({ height: '400px' });
  });

  it('handles empty data gracefully', () => {
    render(<StatisticsChart data={[]} title="Empty Chart" />);
    expect(screen.getByText('Empty Chart')).toBeInTheDocument();
  });
}); 