import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography } from '@mui/material';

const StatisticsChart = ({ data, title }) => {
  return (
    <Box sx={{ width: '100%', height: 400, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 5]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="rating" fill="#8884d8" name="Average Rating" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default StatisticsChart; 