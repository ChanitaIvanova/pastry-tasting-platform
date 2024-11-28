import React from 'react';
import {
  Box,
  TablePagination as MuiTablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';

const TablePagination = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25]
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      <MuiTablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
      />
    </Box>
  );
};

export default TablePagination; 