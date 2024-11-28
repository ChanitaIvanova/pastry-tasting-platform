import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import SearchFilters from '../SearchFilters';

describe('SearchFilters', () => {
  const mockFilters = {
    search: '',
    status: 'all',
    fromDate: null,
    toDate: null
  };

  const mockOnFilterChange = jest.fn();

  const renderComponent = () => {
    return render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <SearchFilters
          filters={mockFilters}
          onFilterChange={mockOnFilterChange}
        />
      </LocalizationProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all filter inputs', () => {
    renderComponent();

    expect(screen.getByPlaceholderText(/search by title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/from date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/to date/i)).toBeInTheDocument();
  });

  it('handles search input changes', () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText(/search by title/i);
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilters,
      search: 'test search'
    });
  });

  it('handles status changes', () => {
    renderComponent();

    const statusSelect = screen.getByLabelText(/status/i);
    fireEvent.mouseDown(statusSelect);
    
    const openOption = screen.getByText('Open');
    fireEvent.click(openOption);

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilters,
      status: 'open'
    });
  });

  it('handles date changes', () => {
    renderComponent();

    const fromDatePicker = screen.getByLabelText(/from date/i);
    const testDate = new Date('2023-01-01');
    
    fireEvent.change(fromDatePicker, { target: { value: testDate } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      ...mockFilters,
      fromDate: expect.any(Date)
    });
  });
}); 