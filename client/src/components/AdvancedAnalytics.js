import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const AdvancedAnalytics = ({ statistics, questionnaire }) => {
  const formatRadarData = () => {
    const data = [];
    const criteria = questionnaire.questions.map(q => q.criterion);
    
    questionnaire.brands.forEach(brand => {
      const brandStats = statistics.brandRatings[brand._id];
      if (brandStats) {
        const dataPoint = {
          brand: brand.name,
          ...criteria.reduce((acc, criterion) => ({
            ...acc,
            [criterion]: brandStats.criteriaScores[criterion] || 0
          }), {})
        };
        data.push(dataPoint);
      }
    });
    
    return data;
  };

  const calculateTrends = () => {
    // Simulate trend data (in a real app, this would come from historical data)
    return questionnaire.brands.map(brand => ({
      name: brand.name,
      data: Array(7).fill(0).map((_, i) => ({
        day: i + 1,
        rating: statistics.brandRatings[brand._id]?.averageScore || 0
      }))
    }));
  };

  const calculateDistribution = () => {
    const distribution = {};
    Object.values(statistics.brandRatings).forEach(brandRating => {
      Object.entries(brandRating.criteriaScores).forEach(([criterion, score]) => {
        if (!distribution[criterion]) {
          distribution[criterion] = {
            name: criterion,
            '1-2': 0,
            '2-3': 0,
            '3-4': 0,
            '4-5': 0
          };
        }
        const bracket = Math.floor(score);
        const key = `${bracket}-${bracket + 1}`;
        distribution[criterion][key]++;
      });
    });
    return Object.values(distribution);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Comparative Analysis
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={formatRadarData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="brand" />
                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                {questionnaire.brands.map((brand, index) => (
                  <Radar
                    key={brand._id}
                    name={brand.name}
                    dataKey={brand.name}
                    stroke={`hsl(${(index * 360) / questionnaire.brands.length}, 70%, 50%)`}
                    fill={`hsl(${(index * 360) / questionnaire.brands.length}, 70%, 50%, 0.3)`}
                  />
                ))}
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Rating Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                {calculateTrends().map((brand, index) => (
                  <Line
                    key={brand.name}
                    data={brand.data}
                    name={brand.name}
                    type="monotone"
                    dataKey="rating"
                    stroke={`hsl(${(index * 360) / questionnaire.brands.length}, 70%, 50%)`}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Rating Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={calculateDistribution()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="1-2" stackId="a" fill="#ff8042" />
                <Bar dataKey="2-3" stackId="a" fill="#ffbb28" />
                <Bar dataKey="3-4" stackId="a" fill="#00c49f" />
                <Bar dataKey="4-5" stackId="a" fill="#0088fe" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdvancedAnalytics; 