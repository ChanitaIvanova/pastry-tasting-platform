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
    expect(screen.getByRole('button', { name: /add question/i })).toBeInTheDocument();
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
        ],
        questions: expect.arrayContaining([
          expect.objectContaining({
            criterion: 'appearance',
            description: 'Rate the appearance of the pastry',
            type: 'rating'
          })
        ])
      }));
    });
  });

  it('allows configuring a single select question', async () => {
    renderQuestionnaireForm();

    const addQuestionButton = screen.getByRole('button', { name: /add question/i });
    fireEvent.click(addQuestionButton);

    const criterionInputs = screen.getAllByLabelText(/criterion/i);
    const descriptionInputs = screen.getAllByLabelText(/description/i);
    const newCriterionInput = criterionInputs[criterionInputs.length - 1];
    const newDescriptionInput = descriptionInputs[descriptionInputs.length - 1];

    await userEvent.type(newCriterionInput, 'occasion');
    await userEvent.type(newDescriptionInput, 'When would you enjoy this?');

    const typeSelects = screen.getAllByLabelText(/type/i);
    const newTypeSelect = typeSelects[typeSelects.length - 1];
    fireEvent.mouseDown(newTypeSelect);
    const singleSelectOption = await screen.findByRole('option', { name: /single select/i });
    fireEvent.click(singleSelectOption);

    const addOptionButton = screen.getByRole('button', { name: /add option/i });
    fireEvent.click(addOptionButton);

    const optionInputs = screen.getAllByLabelText(/option/i);
    await userEvent.type(optionInputs[optionInputs.length - 2], 'Breakfast');
    await userEvent.type(optionInputs[optionInputs.length - 1], 'Dessert');

    questionnaires.create.mockResolvedValueOnce({ data: { id: '1' } });

    await userEvent.type(screen.getByLabelText(/questionnaire title/i), 'Questionnaire with single select');

    const brandInput = screen.getByLabelText(/add brand/i);
    const addBrandButton = screen.getByRole('button', { name: /^add$/i });
    await userEvent.type(brandInput, 'Brand 1');
    fireEvent.click(addBrandButton);
    await userEvent.type(brandInput, 'Brand 2');
    fireEvent.click(addBrandButton);

    fireEvent.click(screen.getByRole('button', { name: /create questionnaire/i }));

    await waitFor(() => {
      expect(questionnaires.create).toHaveBeenCalledWith(expect.objectContaining({
        questions: expect.arrayContaining([
          expect.objectContaining({
            criterion: 'occasion',
            description: 'When would you enjoy this?',
            type: 'single-select',
            options: ['Breakfast', 'Dessert']
          })
        ])
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