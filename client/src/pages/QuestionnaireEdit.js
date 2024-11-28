import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { questionnaires } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';

const QuestionnaireEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [newBrand, setNewBrand] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [newQuestion, setNewQuestion] = useState({
    criterion: '',
    description: ''
  });

  useEffect(() => {
    fetchQuestionnaire();
  }, [id]);

  const fetchQuestionnaire = async () => {
    try {
      const response = await questionnaires.getOne(id);
      setQuestionnaire(response.data);
    } catch (err) {
      setError('Failed to fetch questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = () => {
    if (newBrand.trim()) {
      setQuestionnaire(prev => ({
        ...prev,
        brands: [...prev.brands, { name: newBrand.trim() }]
      }));
      setNewBrand('');
    }
  };

  const handleRemoveBrand = (index) => {
    setQuestionnaire(prev => ({
      ...prev,
      brands: prev.brands.filter((_, i) => i !== index)
    }));
  };

  const handleAddQuestion = () => {
    if (newQuestion.criterion.trim() && newQuestion.description.trim()) {
      setQuestionnaire(prev => ({
        ...prev,
        questions: [...prev.questions, { ...newQuestion }]
      }));
      setNewQuestion({ criterion: '', description: '' });
    }
  };

  const handleRemoveQuestion = (index) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      await questionnaires.update(id, questionnaire);
      showNotification('Questionnaire updated successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update questionnaire');
      showNotification('Failed to update questionnaire', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!questionnaire) return <Alert severity="error">Questionnaire not found</Alert>;
  if (questionnaire.status === 'closed') {
    return <Alert severity="warning">Cannot edit closed questionnaire</Alert>;
  }

  return (
    <Box maxWidth="md" mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Edit Questionnaire: {questionnaire.title}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Brands" />
          <Tab label="Questions" />
        </Tabs>

        {activeTab === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Brands
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                label="Add Brand"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleAddBrand}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>

            <List>
              {questionnaire.brands.map((brand, index) => (
                <ListItem key={index} divider>
                  <ListItemText primary={brand.name} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveBrand(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Questions
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="Criterion"
                value={newQuestion.criterion}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, criterion: e.target.value }))}
                size="small"
                sx={{ flex: 1 }}
              />
              <TextField
                label="Description"
                value={newQuestion.description}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, description: e.target.value }))}
                size="small"
                sx={{ flex: 2 }}
              />
              <Button
                variant="contained"
                onClick={handleAddQuestion}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>

            <List>
              {questionnaire.questions.map((question, index) => (
                <ListItem key={index} divider>
                  <ListItemText 
                    primary={question.criterion}
                    secondary={question.description}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveQuestion(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default QuestionnaireEdit; 