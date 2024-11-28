import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import Dashboard from '../Dashboard';
import { questionnaires } from '../../services/api';

jest.mock('../../services/api');

const mockQuestionnaires = [
  {
    _id: '1',
    title: 'Test Questionnaire 1',
    status: 'open',
    brands: [{ name: 'Brand 1' }, { name: 'Brand 2' }],
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    title: 'Test Questionnaire 2',
    status: 'closed',
    brands: [{ name: 'Brand 3' }, { name: 'Brand 4' }],
    createdAt: new Date().toISOString()
  }
];

const renderDashboard = (userRole = 'client') => {
  return render(
    <BrowserRouter>
      <AuthProvider value={{ user: { role: userRole } }}>
        <NotificationProvider>
          <Dashboard />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    questionnaires.getAll.mockResolvedValue({ data: mockQuestionnaires });
  });

  it('renders loading state initially', () => {
    renderDashboard();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays questionnaires after loading', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Test Questionnaire 1')).toBeInTheDocument();
      expect(screen.getByText('Test Questionnaire 2')).toBeInTheDocument();
    });
  });

  it('shows admin controls for admin users', async () => {
    renderDashboard('admin');
    await waitFor(() => {
      expect(screen.getByText(/new questionnaire/i)).toBeInTheDocument();
      expect(screen.getAllByText(/statistics/i)).toHaveLength(mockQuestionnaires.length);
    });
  });

  it('filters questionnaires by search term', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText('Test Questionnaire 1')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by title/i);
    fireEvent.change(searchInput, { target: { value: 'Questionnaire 1' } });

    expect(screen.getByText('Test Questionnaire 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Questionnaire 2')).not.toBeInTheDocument();
  });

  it('handles questionnaire closing', async () => {
    questionnaires.close.mockResolvedValueOnce({});
    renderDashboard('admin');

    await waitFor(() => {
      expect(screen.getByText('Test Questionnaire 1')).toBeInTheDocument();
    });

    const closeButton = screen.getAllByText(/close/i)[0];
    fireEvent.click(closeButton);

    const confirmButton = screen.getByText(/close questionnaire/i);
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(questionnaires.close).toHaveBeenCalledWith('1');
    });
  });

  it('handles errors during data fetching', async () => {
    questionnaires.getAll.mockRejectedValueOnce(new Error('Failed to fetch'));
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch questionnaires/i)).toBeInTheDocument();
    });
  });
}); 