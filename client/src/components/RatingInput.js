import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Box,
  Typography
} from '@mui/material';

const RatingInput = ({ 
  criterion, 
  rating, 
  comment, 
  onChange, 
  disabled = false 
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <FormControl component="fieldset">
        <FormLabel component="legend" sx={{ textTransform: 'capitalize' }}>
          {criterion}
        </FormLabel>
        <RadioGroup
          row
          value={rating || ''}
          onChange={(e) => onChange(criterion, 'rating', parseInt(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <FormControlLabel
              key={value}
              value={value}
              control={<Radio />}
              label={value}
              disabled={disabled}
            />
          ))}
        </RadioGroup>
      </FormControl>
      <TextField
        fullWidth
        multiline
        rows={2}
        label="Comments (optional)"
        value={comment || ''}
        onChange={(e) => onChange(criterion, 'comment', e.target.value)}
        disabled={disabled}
        sx={{ mt: 1 }}
      />
    </Box>
  );
};

export default RatingInput; 