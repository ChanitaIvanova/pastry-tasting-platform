import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  TextField
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { questionnaires, responses } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import RatingInput from '../components/RatingInput';
import { validateResponse } from '../utils/validation';
import { useNotification } from '../contexts/NotificationContext';

const Questionnaire = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [evaluations, setEvaluations] = useState({});
  const [preferredBrand, setPreferredBrand] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();
  const [existingResponse, setExistingResponse] = useState(null);

  useEffect(() => {
    fetchQuestionnaire();
  }, [id]);

  useEffect(() => {
    if (questionnaire) {
      fetchExistingResponse();
    }
  }, [questionnaire]);

  const fetchQuestionnaire = async () => {
    try {
      const response = await questionnaires.getOne(id);
      setQuestionnaire(response.data);
      const initial = {};
      response.data.brands.forEach(brand => {
        initial[brand._id] = {};
        response.data.questions.forEach(question => {
          initial[brand._id][question.criterion] = { rating: null, comment: '' };
        });
      });
      setEvaluations(initial);
    } catch (err) {
      setError('Failed to fetch questionnaire');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingResponse = async () => {
    try {
      const response = await responses.getMyResponses();
      const existing = response.data.find(r => r.questionnaire._id === id);
      if (existing) {
        setExistingResponse(existing);
        initializeFromExistingResponse(existing);
      }
    } catch (err) {
      console.error('Failed to fetch existing response:', err);
    }
  };

  const initializeFromExistingResponse = (response) => {
    if (!questionnaire) return;
    
    const evaluationsData = {};
    response.answers.forEach(answer => {
      if (!evaluationsData[answer.brand]) {
        evaluationsData[answer.brand] = {};
        questionnaire.questions.forEach(question => {
          evaluationsData[answer.brand][question.criterion] = { rating: null, comment: '' };
        });
      }
      evaluationsData[answer.brand][answer.criterion] = {
        rating: answer.rating,
        comment: answer.comments || ''
      };
    });
    setEvaluations(evaluationsData);
    setPreferredBrand(response.comparativeEvaluation.preferredBrand);
    setComments(response.comparativeEvaluation.comments || '');
  };

  const handleRatingChange = (brandId, criterion, field, value) => {
    setEvaluations(prev => ({
      ...prev,
      [brandId]: {
        ...prev[brandId],
        [criterion]: {
          ...prev[brandId][criterion],
          [field]: value
        }
      }
    }));
  };

  const isStepComplete = (brandId) => {
    const brandEval = evaluations[brandId];
    return questionnaire.questions.every(question => 
      brandEval?.[question.criterion]?.rating !== null
    );
  };

  const handleSubmit = async () => {
    const formattedAnswers = [];
    Object.entries(evaluations).forEach(([brandId, criteria]) => {
      Object.entries(criteria).forEach(([criterion, { rating, comment }]) => {
        formattedAnswers.push({
          brand: brandId,
          criterion,
          rating,
          comments: comment
        });
      });
    });

    const responseData = {
      answers: formattedAnswers,
      comparativeEvaluation: {
        preferredBrand,
        comments
      }
    };

    const { isValid, errors } = validateResponse(responseData);
    
    if (!isValid) {
      setError(Object.values(errors).join('. '));
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (existingResponse) {
        await responses.update(existingResponse._id, responseData);
        showNotification('Evaluation updated successfully', 'success');
      } else {
        await responses.submit(id, responseData);
        showNotification('Evaluation submitted successfully', 'success');
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit evaluation');
      showNotification('Failed to save evaluation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!questionnaire) return <Alert severity="error">Questionnaire not found</Alert>;

  return (
    <Box maxWidth="md" mx="auto">
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {questionnaire.title}
          {existingResponse && (
            <Typography variant="subtitle1" color="text.secondary">
              Editing existing response
            </Typography>
          )}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} orientation="vertical">
          {questionnaire.brands.map((brand, index) => (
            <Step key={brand._id}>
              <StepLabel>
                <Typography variant="h6">{brand.name}</Typography>
              </StepLabel>
              <StepContent>
                {questionnaire.questions.map(question => (
                  <RatingInput
                    key={question.criterion}
                    criterion={question.criterion}
                    description={question.description}
                    rating={evaluations[brand._id][question.criterion]?.rating}
                    comment={evaluations[brand._id][question.criterion]?.comment}
                    onChange={(c, field, value) => 
                      handleRatingChange(brand._id, c, field, value)}
                    disabled={questionnaire.status === 'closed'}
                  />
                ))}
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(index + 1)}
                    sx={{ mt: 1, mr: 1 }}
                    disabled={!isStepComplete(brand._id)}
                  >
                    {index === questionnaire.brands.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  {index > 0 && (
                    <Button
                      onClick={() => setActiveStep(index - 1)}
                      sx={{ mt: 1, mr: 1 }}
                    >
                      Back
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {activeStep === questionnaire.brands.length && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Final Evaluation
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Preferred Brand</InputLabel>
              <Select
                value={preferredBrand}
                onChange={(e) => setPreferredBrand(e.target.value)}
                label="Preferred Brand"
                disabled={questionnaire.status === 'closed'}
              >
                {questionnaire.brands.map(brand => (
                  <MenuItem key={brand._id} value={brand._id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Additional Comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={questionnaire.status === 'closed'}
              sx={{ mb: 3 }}
            />
            <Divider sx={{ my: 3 }} />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting || questionnaire.status === 'closed'}
              >
                {submitting ? 'Saving...' : existingResponse ? 'Update Evaluation' : 'Submit Evaluation'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Questionnaire; 