import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  Typography
} from '@mui/material';

const RatingInput = ({ 
  criterion, 
  rating, 
  onChange, 
  disabled = false,
  description 
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <FormControl component="fieldset">
        <FormLabel component="legend" sx={{ textTransform: 'capitalize' }}>
          {criterion}
        </FormLabel>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {description}
          </Typography>
        )}
        <RadioGroup
          row
          value={rating || ''}
          onChange={(e) => onChange(criterion, 'rating', parseInt(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <FormControlLabel
              key={value}
              value={value}
              control={<Radio sx={{ p: 0.5 }}/>}
              label={value}
              disabled={disabled}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default RatingInput; 