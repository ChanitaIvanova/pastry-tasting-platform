import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import BatchOperations from '../BatchOperations';

describe('BatchOperations', () => {
  const mockProps = {
    selectedItems: ['1', '2', '3'],
    onClose: jest.fn(),
    onDelete: jest.fn(),
    onExport: jest.fn(),
    onCloseQuestionnaires: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders selected items count', () => {
    render(<BatchOperations {...mockProps} />);
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('shows actions menu when clicked', () => {
    render(<BatchOperations {...mockProps} />);
    
    // Click the actions button
    fireEvent.click(screen.getByRole('button', { name: /actions/i }));

    // Check if menu items are shown
    expect(screen.getByText('Close Selected')).toBeInTheDocument();
    expect(screen.getByText('Export Selected')).toBeInTheDocument();
    expect(screen.getByText('Delete Selected')).toBeInTheDocument();
  });

  it('calls appropriate handlers when actions are clicked', () => {
    render(<BatchOperations {...mockProps} />);
    
    // Open menu
    fireEvent.click(screen.getByRole('button', { name: /actions/i }));

    // Test close action
    fireEvent.click(screen.getByText('Close Selected'));
    expect(mockProps.onCloseQuestionnaires).toHaveBeenCalled();

    // Open menu again
    fireEvent.click(screen.getByRole('button', { name: /actions/i }));

    // Test export action
    fireEvent.click(screen.getByText('Export Selected'));
    expect(mockProps.onExport).toHaveBeenCalled();

    // Open menu again
    fireEvent.click(screen.getByRole('button', { name: /actions/i }));

    // Test delete action
    fireEvent.click(screen.getByText('Delete Selected'));
    expect(mockProps.onDelete).toHaveBeenCalled();
  });

  it('renders delete option in red', () => {
    render(<BatchOperations {...mockProps} />);
    
    // Open menu
    fireEvent.click(screen.getByRole('button', { name: /actions/i }));

    // Check if delete option has error color
    const deleteMenuItem = screen.getByText('Delete Selected').closest('li');
    expect(deleteMenuItem).toHaveStyle({ color: expect.stringContaining('error') });
  });

  it('disables actions when no items are selected', () => {
    render(<BatchOperations selectedItems={[]} {...mockProps} />);
    
    const actionsButton = screen.getByRole('button', { name: /actions/i });
    expect(actionsButton).toBeDisabled();
  });
}); 