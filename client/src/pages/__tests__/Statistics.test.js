import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClientProvider } from 'react-query';
import { queryClient } from '../../services/queryClient';
import Statistics from '../Statistics';
import { questionnaires, responses } from '../../services/api';

// Mock the API calls
jest.mock('../../services/api');

const mockQuestionnaire = {
  _id: '1',
  title: 'Test Questionnaire',
  brands: [
    { _id: 'brand1', name: 'Brand 1' },
    { _id: 'brand2', name: 'Brand 2' }
  ],
  status: 'closed'
};

const mockStatistics = {
  totalResponses: 2,
  brandRatings: {
    brand1: {
      averageScore: 4.5,
      criteriaScores: {
        appearance: 4,
        flavor: 5
      }
    },
    brand2: {
      averageScore: 3.5,
      criteriaScores: {
        appearance: 3,
        flavor: 4
      }
    }
  },
  brandPreferences: {
    brand1: 1,
    brand2: 1
  }
};

describe('Statistics', () => {
  beforeEach(() => {
    questionnaires.getOne.mockResolvedValue({ data: mockQuestionnaire });
    responses.getStatistics.mockResolvedValue({ data: mockStatistics });
  });

  const renderStatistics = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/questionnaires/1/statistics']}>
          <Routes>
            <Route path="/questionnaires/:id/statistics" element={<Statistics />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders loading state initially', () => {
    renderStatistics();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays questionnaire title and statistics after loading', async () => {
    renderStatistics();

    await waitFor(() => {
      expect(screen.getByText('Test Questionnaire - Statistics')).toBeInTheDocument();
      expect(screen.getByText('Total Responses')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('displays error message when API call fails', async () => {
    questionnaires.getOne.mockRejectedValue(new Error('Failed to fetch'));

    renderStatistics();

    await waitFor(() => {
      expect(screen.getByText(/failed to load statistics/i)).toBeInTheDocument();
    });
  });

  it('renders brand comparison table', async () => {
    renderStatistics();

    await waitFor(() => {
      expect(screen.getByText('Brand 1')).toBeInTheDocument();
      expect(screen.getByText('Brand 2')).toBeInTheDocument();
      expect(screen.getByText('4.50')).toBeInTheDocument();
      expect(screen.getByText('3.50')).toBeInTheDocument();
    });
  });
}); 