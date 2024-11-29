import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Bar
} from 'recharts';
import { questionnaires, responses } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Download as DownloadIcon } from '@mui/icons-material';
import { exportToExcel, formatQuestionnaireData } from '../utils/export';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import { useNotification } from '../contexts/NotificationContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Statistics = () => {
  const { id } = useParams();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [questionnaireRes, statsRes] = await Promise.all([
        questionnaires.getOne(id),
        responses.getStatistics(id)
      ]);
      setQuestionnaire(questionnaireRes.data);
      setStatistics(statsRes.data);
    } catch (err) {
      setError('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCriteriaData = (criterion) => {
    if (!statistics || !questionnaire) return [];
    
    return questionnaire.brands.map(brand => ({
      name: brand.name,
      rating: statistics.brandRatings[brand._id]?.criteriaScores[criterion]?.toFixed(2) || 0
    }));
  };

  const formatPreferenceData = () => {
    if (!statistics?.brandPreferences || !questionnaire) return [];

    return Object.entries(statistics.brandPreferences).map(([brandId, count]) => {
      const brand = questionnaire.brands.find(b => b._id === brandId);
      return {
        name: brand?.name || 'Unknown',
        value: count
      };
    });
  };

  const handleExport = () => {
    const formattedData = formatQuestionnaireData(questionnaire, statistics);
    exportToExcel(formattedData, `${questionnaire.title}-statistics`);
    showNotification('Statistics exported successfully', 'success');
  };

  if (loading) return <LoadingSpinner />;
  if (!questionnaire || !statistics) return <Alert severity="error">Failed to load statistics</Alert>;

  return (
    <Box>
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Typography variant="h4" component="h1">
          {questionnaire.title} - Statistics
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export Data
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Responses</Typography>
              <Typography variant="h3">{statistics.totalResponses}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Brand Preferences
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={formatPreferenceData()}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {formatPreferenceData().map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Criteria Ratings Charts
        </Typography>
        <Grid container spacing={3}>
          {questionnaire.questions.map(question => (
            <Grid item xs={12} md={6} key={question.criterion}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
                  {question.criterion}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {question.description}
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={formatCriteriaData(question.criterion)}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar
                        dataKey="rating"
                        fill="#8884d8"
                        name="Rating"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Advanced Analytics
        </Typography>
        <AdvancedAnalytics
          statistics={statistics}
          questionnaire={questionnaire}
        />
      </Paper>
    </Box>
  );
};

export default Statistics; 