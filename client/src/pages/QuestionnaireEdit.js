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
  MenuItem,
  Grid,
  FormHelperText
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { questionnaires } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';

const QUESTION_TYPES = {
  RATING: 'rating',
  SINGLE_SELECT: 'single-select',
  TEXT: 'text'
};

const QuestionnaireEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [newBrand, setNewBrand] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchQuestionnaire();
  }, [id]);

  const fetchQuestionnaire = async () => {
    try {
      const response = await questionnaires.getOne(id);
      setQuestionnaire(response.data);
      setTitle(response.data.title);
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
    setQuestionnaire(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          criterion: '',
          description: '',
          type: QUESTION_TYPES.RATING,
          options: []
        }
      ]
    }));
  };

  const handleRemoveQuestion = (index) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.map((question, i) => (
        i === index ? { ...question, [field]: value } : question
      ))
    }));
  };

  const handleQuestionTypeChange = (index, type) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.map((question, i) => {
        if (i !== index) return question;
        const updatedQuestion = { ...question, type };

        if (type === QUESTION_TYPES.SINGLE_SELECT) {
          updatedQuestion.options = question.options && question.options.length > 0
            ? question.options
            : [''];
          delete updatedQuestion.maxLength;
        } else if (type === QUESTION_TYPES.TEXT) {
          updatedQuestion.maxLength = 500;
          delete updatedQuestion.options;
        } else {
          delete updatedQuestion.options;
          delete updatedQuestion.maxLength;
        }

        return updatedQuestion;
      })
    }));
  };

  const handleAddOption = (questionIndex) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.map((question, i) => {
        if (i !== questionIndex) return question;
        const options = question.options ? [...question.options, ''] : [''];
        return { ...question, options };
      })
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.map((question, i) => {
        if (i !== questionIndex) return question;
        const options = [...(question.options || [])];
        options[optionIndex] = value;
        return { ...question, options };
      })
    }));
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    setQuestionnaire(prev => ({
      ...prev,
      questions: prev.questions.map((question, i) => {
        if (i !== questionIndex) return question;
        const options = (question.options || []).filter((_, idx) => idx !== optionIndex);
        return { ...question, options: options.length ? options : [''] };
      })
    }));
  };

  const formatQuestionsForSubmit = (questions) => questions.map(question => {
    const type = question.type || QUESTION_TYPES.RATING;
    const formatted = {
      ...(question._id ? { _id: question._id } : {}),
      criterion: question.criterion?.trim() || '',
      description: question.description?.trim() || '',
      type
    };

    if (type === QUESTION_TYPES.SINGLE_SELECT) {
      formatted.options = (question.options || [])
        .map(option => option.trim())
        .filter(Boolean);
    }

    if (type === QUESTION_TYPES.TEXT) {
      formatted.maxLength = 500;
    }

    return formatted;
  });

  const handleSave = async () => {
    try {
      await questionnaires.update(id, {
        ...questionnaire,
        title: title.trim(),
        questions: formatQuestionsForSubmit(questionnaire.questions)
      });
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
          Edit Questionnaire
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Questionnaire Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
          required
          sx={{ mb: 3 }}
        />

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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="outlined"
                onClick={handleAddQuestion}
                startIcon={<AddIcon />}
              >
                Add Question
              </Button>
            </Box>

            {questionnaire.questions.map((question, index) => (
              <Paper
                key={question._id || index}
                variant="outlined"
                sx={{ p: 2, mb: 2 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                  }}
                >
                  <Typography variant="subtitle1">
                    Question {index + 1}
                  </Typography>
                  <IconButton
                    edge="end"
                    onClick={() => handleRemoveQuestion(index)}
                    size="small"
                    aria-label="Delete question"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Criterion"
                      value={question.criterion}
                      onChange={(e) => handleQuestionChange(index, 'criterion', e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <TextField
                      label="Description"
                      value={question.description}
                      onChange={(e) => handleQuestionChange(index, 'description', e.target.value)}
                      fullWidth
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={question.type || QUESTION_TYPES.RATING}
                        label="Type"
                        onChange={(e) => handleQuestionTypeChange(index, e.target.value)}
                      >
                        <MenuItem value={QUESTION_TYPES.RATING}>Brand rating</MenuItem>
                        <MenuItem value={QUESTION_TYPES.SINGLE_SELECT}>Single select</MenuItem>
                        <MenuItem value={QUESTION_TYPES.TEXT}>Open text</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {question.type === QUESTION_TYPES.SINGLE_SELECT && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">
                      Answer options
                    </Typography>
                    {(question.options || []).map((option, optionIndex) => (
                      <Box
                        key={optionIndex}
                        sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}
                      >
                        <TextField
                          label={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                          size="small"
                          fullWidth
                        />
                        <IconButton
                          onClick={() => handleRemoveOption(index, optionIndex)}
                          size="small"
                          aria-label="Remove option"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      sx={{ mt: 1 }}
                      onClick={() => handleAddOption(index)}
                    >
                      Add option
                    </Button>
                  </Box>
                )}

                {question.type === QUESTION_TYPES.TEXT && (
                  <FormHelperText sx={{ mt: 2 }}>
                    Responses are limited to 500 characters.
                  </FormHelperText>
                )}
              </Paper>
            ))}

            {questionnaire.questions.length === 0 && (
              <Typography color="text.secondary" align="center">
                No questions added yet
              </Typography>
            )}
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