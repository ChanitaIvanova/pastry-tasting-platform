import React from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const SearchFilters = ({ filters, onFilterChange }) => {
  const handleChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search by title..."
            size="small"
          />
        </Grid>
        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              label="Status"
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="From Date"
              value={filters.fromDate}
              onChange={(date) => handleChange('fromDate', date)}
              renderInput={(params) => (
                <TextField {...params} fullWidth size="small" />
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} md={3}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="To Date"
              value={filters.toDate}
              onChange={(date) => handleChange('toDate', date)}
              renderInput={(params) => (
                <TextField {...params} fullWidth size="small" />
              )}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SearchFilters; 