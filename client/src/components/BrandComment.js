import React, { useState } from 'react';
import {
  Box,
  TextField,
  Link,
  Typography
} from '@mui/material';

const BrandComment = ({ 
  brandName,
  comment, 
  onChange, 
  disabled = false 
}) => {
  const [showComment, setShowComment] = useState(Boolean(comment));

  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      {!showComment ? (
        <Link
          component="button"
          variant="body2"
          onClick={() => setShowComment(true)}
          sx={{ textDecoration: 'none' }}
          disabled={disabled}
        >
          Add Comment
        </Link>
      ) : (
        <TextField
          fullWidth
          multiline
          rows={3}
          label={`Comments for ${brandName} (optional)`}
          value={comment || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )}
    </Box>
  );
};

export default BrandComment; 