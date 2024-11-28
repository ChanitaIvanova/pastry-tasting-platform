import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box
} from '@mui/material';
import { format } from 'date-fns';

const getActionColor = (action) => {
  const colors = {
    LOGIN: 'default',
    CREATE_QUESTIONNAIRE: 'success',
    UPDATE_QUESTIONNAIRE: 'info',
    CLOSE_QUESTIONNAIRE: 'warning',
    DELETE_QUESTIONNAIRE: 'error',
    SUBMIT_RESPONSE: 'primary',
    UPDATE_RESPONSE: 'secondary',
    VIEW_STATISTICS: 'default'
  };
  return colors[action] || 'default';
};

const ActivityLogs = ({ logs }) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log._id}>
              <TableCell>
                {format(new Date(log.createdAt), 'PPpp')}
              </TableCell>
              <TableCell>{log.user.username}</TableCell>
              <TableCell>
                <Chip
                  label={log.action.replace(/_/g, ' ')}
                  color={getActionColor(log.action)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {log.entityType}: {log.entityId}
                  </Typography>
                  {Object.entries(log.details).map(([key, value]) => (
                    <Typography key={key} variant="caption" display="block" color="text.secondary">
                      {key}: {JSON.stringify(value)}
                    </Typography>
                  ))}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ActivityLogs; 