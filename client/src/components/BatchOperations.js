import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

const BatchOperations = ({
  selectedItems,
  onClose,
  onDelete,
  onExport,
  onCloseQuestionnaires
}) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    handleClose();
    switch (action) {
      case 'delete':
        onDelete();
        break;
      case 'close':
        onCloseQuestionnaires();
        break;
      case 'export':
        onExport();
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {selectedItems.length} selected
      </Typography>
      <Button
        size="small"
        startIcon={<MoreVertIcon />}
        onClick={handleClick}
        variant="outlined"
      >
        Actions
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleAction('close')}>
          <LockIcon sx={{ mr: 1 }} fontSize="small" />
          Close Selected
        </MenuItem>
        <MenuItem onClick={() => handleAction('export')}>
          <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
          Export Selected
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Delete Selected
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default BatchOperations; 