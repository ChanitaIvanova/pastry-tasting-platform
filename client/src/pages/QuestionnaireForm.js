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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormHelperText
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { questionnaires } from '../services/api';
import { validateQuestionnaire } from '../utils/validation';
import { useNotification } from '../contexts/NotificationContext';

const QUESTION_TYPES = {
  RATING: 'rating',
  SINGLE_SELECT: 'single-select',
  TEXT: 'text'
};

const QuestionnaireForm = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [brands, setBrands] = useState([]);
  const [questions, setQuestions] = useState([
    { criterion: 'appearance', description: 'Rate the appearance of the pastry', type: QUESTION_TYPES.RATING },
    { criterion: 'aroma', description: 'Rate the aroma of the pastry', type: QUESTION_TYPES.RATING },
    { criterion: 'texture', description: 'Rate the texture/mouthfeel of the pastry', type: QUESTION_TYPES.RATING },
    { criterion: 'flavor', description: 'Rate the flavor/taste of the pastry', type: QUESTION_TYPES.RATING },
    { criterion: 'aftertaste', description: 'Rate the aftertaste of the pastry', type: QUESTION_TYPES.RATING },
    { criterion: 'overall', description: 'Rate the overall quality of the pastry', type: QUESTION_TYPES.RATING }
  ]);
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
    setQuestions(prev => ([
      ...prev,
      {
        criterion: '',
        description: '',
        type: QUESTION_TYPES.RATING,
        options: []
      }
    ]));
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions(prev => prev.map((question, i) => (
      i === index ? { ...question, [field]: value } : question
    )));
  };

  const handleQuestionTypeChange = (index, type) => {
    setQuestions(prev => prev.map((question, i) => {
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
    }));
  };

  const handleAddOption = (questionIndex) => {
    setQuestions(prev => prev.map((question, i) => {
      if (i !== questionIndex) return question;
      const options = question.options ? [...question.options, ''] : [''];
      return { ...question, options };
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuestions(prev => prev.map((question, i) => {
      if (i !== questionIndex) return question;
      const options = [...(question.options || [])];
      options[optionIndex] = value;
      return { ...question, options };
    }));
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    setQuestions(prev => prev.map((question, i) => {
      if (i !== questionIndex) return question;
      const options = (question.options || []).filter((_, idx) => idx !== optionIndex);
      return { ...question, options: options.length ? options : [''] };
    }));
  };

  const formatQuestionsForSubmit = (questionList) => questionList.map(question => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const formattedQuestions = formatQuestionsForSubmit(questions);

    const questionnaireData = {
      title: title.trim(),
      brands,
      questions: formattedQuestions
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
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="outlined"
                onClick={handleAddQuestion}
                startIcon={<AddIcon />}
              >
                Add Question
              </Button>
            </Box>

            {questions.map((question, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
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

            {questions.length === 0 && (
              <Typography color="text.secondary" align="center">
                No questions added yet
              </Typography>
            )}
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