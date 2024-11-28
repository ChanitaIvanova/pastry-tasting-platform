import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Divider
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { questionnaires } from '../services/api';
import { validateQuestionnaire } from '../utils/validation';
import { useNotification } from '../contexts/NotificationContext';

const QuestionnaireForm = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [brands, setBrands] = useState([]);
  const [questions, setQuestions] = useState([
    { criterion: 'appearance', description: 'Rate the appearance of the pastry' },
    { criterion: 'aroma', description: 'Rate the aroma of the pastry' },
    { criterion: 'texture', description: 'Rate the texture/mouthfeel of the pastry' },
    { criterion: 'flavor', description: 'Rate the flavor/taste of the pastry' },
    { criterion: 'aftertaste', description: 'Rate the aftertaste of the pastry' },
    { criterion: 'overall', description: 'Rate the overall quality of the pastry' }
  ]);
  const [newQuestion, setNewQuestion] = useState({ criterion: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleAddBrand = () => {
    if (newBrand.trim()) {
      setBrands([...brands, { name: newBrand.trim() }]);
      setNewBrand('');
    }
  };

  const handleRemoveBrand = (index) => {
    setBrands(brands.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    if (newQuestion.criterion.trim() && newQuestion.description.trim()) {
      setQuestions([...questions, { ...newQuestion }]);
      setNewQuestion({ criterion: '', description: '' });
    }
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const questionnaireData = {
      title: title.trim(),
      brands,
      questions
    };

    const { isValid, errors } = validateQuestionnaire(questionnaireData);
    
    if (!isValid) {
      setError(Object.values(errors).join('. '));
      return;
    }

    setLoading(true);

    try {
      await questionnaires.create(questionnaireData);
      showNotification('Questionnaire created successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create questionnaire');
      showNotification('Failed to create questionnaire', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="md" mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Create New Questionnaire
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Questionnaire Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />

          <Box sx={{ mt: 3 }}>
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
              {brands.map((brand, index) => (
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

            {brands.length === 0 && (
              <Typography color="text.secondary" align="center" sx={{ my: 2 }}>
                No brands added yet
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 3 }}>
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
              {questions.map((question, index) => (
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

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Questionnaire'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default QuestionnaireForm; 