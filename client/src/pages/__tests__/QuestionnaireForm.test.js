import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from '../../contexts/NotificationContext';
import QuestionnaireForm from '../QuestionnaireForm';
import { questionnaires } from '../../services/api';

jest.mock('../../services/api');

const renderQuestionnaireForm = () => {
  return render(
    <BrowserRouter>
      <NotificationProvider>
        <QuestionnaireForm />
      </NotificationProvider>
    </BrowserRouter>
  );
};

describe('QuestionnaireForm', () => {
  beforeEach(() => {
    questionnaires.create.mockClear();
  });

  it('renders form elements correctly', () => {
    renderQuestionnaireForm();
    expect(screen.getByLabelText(/questionnaire title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/add brand/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('allows adding and removing brands', async () => {
    renderQuestionnaireForm();
    const brandInput = screen.getByLabelText(/add brand/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    await userEvent.type(brandInput, 'Brand 1');
    fireEvent.click(addButton);
    expect(screen.getByText('Brand 1')).toBeInTheDocument();

    await userEvent.type(brandInput, 'Brand 2');
    fireEvent.click(addButton);
    expect(screen.getByText('Brand 2')).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    expect(screen.queryByText('Brand 1')).not.toBeInTheDocument();
  });

  it('validates form before submission', async () => {
    renderQuestionnaireForm();
    const submitButton = screen.getByRole('button', { name: /create questionnaire/i });

    fireEvent.click(submitButton);
    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/questionnaire title/i), 'Test Title');
    fireEvent.click(submitButton);
    expect(await screen.findByText(/at least two brands are required/i)).toBeInTheDocument();
  });

  it('handles successful form submission', async () => {
    questionnaires.create.mockResolvedValueOnce({ data: { id: '1' } });
    renderQuestionnaireForm();

    await userEvent.type(screen.getByLabelText(/questionnaire title/i), 'Test Questionnaire');
    
    const brandInput = screen.getByLabelText(/add brand/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    await userEvent.type(brandInput, 'Brand 1');
    fireEvent.click(addButton);
    await userEvent.type(brandInput, 'Brand 2');
    fireEvent.click(addButton);

    fireEvent.click(screen.getByRole('button', { name: /create questionnaire/i }));

    await waitFor(() => {
      expect(questionnaires.create).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Questionnaire',
        brands: [
          { name: 'Brand 1' },
          { name: 'Brand 2' }
        ]
      }));
    });
  });

  it('handles submission errors', async () => {
    questionnaires.create.mockRejectedValueOnce({
      response: { data: { message: 'Server error' } }
    });
    renderQuestionnaireForm();

    await userEvent.type(screen.getByLabelText(/questionnaire title/i), 'Test');
    const brandInput = screen.getByLabelText(/add brand/i);
    const addButton = screen.getByRole('button', { name: /add/i });

    await userEvent.type(brandInput, 'Brand 1');
    fireEvent.click(addButton);
    await userEvent.type(brandInput, 'Brand 2');
    fireEvent.click(addButton);

    fireEvent.click(screen.getByRole('button', { name: /create questionnaire/i }));

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });
}); 