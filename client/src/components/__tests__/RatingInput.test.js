import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RatingInput from '../RatingInput';

describe('RatingInput', () => {
  const mockOnChange = jest.fn();
  const defaultProps = {
    criterion: 'appearance',
    rating: null,
    comment: '',
    onChange: mockOnChange
  };

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with correct criterion label', () => {
    render(<RatingInput {...defaultProps} />);
    expect(screen.getByText(/appearance/i)).toBeInTheDocument();
  });

  it('renders all rating options (1-5)', () => {
    render(<RatingInput {...defaultProps} />);
    [1, 2, 3, 4, 5].forEach(rating => {
      expect(screen.getByLabelText(rating.toString())).toBeInTheDocument();
    });
  });

  it('calls onChange with correct values when rating is selected', () => {
    render(<RatingInput {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('4'));
    expect(mockOnChange).toHaveBeenCalledWith('appearance', 'rating', 4);
  });

  it('calls onChange with correct values when comment is entered', async () => {
    render(<RatingInput {...defaultProps} />);
    const commentInput = screen.getByLabelText(/comments/i);
    await userEvent.type(commentInput, 'Test comment');
    expect(mockOnChange).toHaveBeenCalledWith('appearance', 'comment', 'Test comment');
  });

  it('displays existing rating when provided', () => {
    render(<RatingInput {...defaultProps} rating={4} />);
    expect(screen.getByLabelText('4')).toBeChecked();
  });

  it('displays existing comment when provided', () => {
    render(<RatingInput {...defaultProps} comment="Existing comment" />);
    expect(screen.getByLabelText(/comments/i)).toHaveValue('Existing comment');
  });

  it('disables all inputs when disabled prop is true', () => {
    render(<RatingInput {...defaultProps} disabled={true} />);
    const radioButtons = screen.getAllByRole('radio');
    const commentInput = screen.getByLabelText(/comments/i);

    radioButtons.forEach(radio => {
      expect(radio).toBeDisabled();
    });
    expect(commentInput).toBeDisabled();
  });
}); 