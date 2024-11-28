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
import { Save } from '@mui/icons-material';

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
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [loadingResponse, setLoadingResponse] = useState(true);

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
      setLoadingResponse(true);
      const response = await responses.getMyResponses();
      const existing = response.data.find(r => r.questionnaire._id === id);
      if (existing) {
        setExistingResponse(existing);
        initializeFromExistingResponse(existing);
      }
    } catch (err) {
      console.error('Failed to fetch existing response:', err);
    } finally {
      setLoadingResponse(false);
    }
  };

  const initializeFromExistingResponse = (response) => {
    if (!questionnaire) return;
    
    const evaluationsData = {};
    questionnaire.brands.forEach(brand => {
      evaluationsData[brand._id] = {};
      questionnaire.questions.forEach(question => {
        evaluationsData[brand._id][question.criterion] = { rating: null, comment: '' };
      });
    });

    response.answers.forEach(answer => {
      if (!evaluationsData[answer.brand]) {
        evaluationsData[answer.brand] = {};
      }
      evaluationsData[answer.brand][answer.criterion] = {
        rating: answer.rating || null,
        comment: answer.comments || ''
      };
    });

    setEvaluations(evaluationsData);
    
    if (response.comparativeEvaluation) {
      if (response.comparativeEvaluation.preferredBrand) {
        setPreferredBrand(response.comparativeEvaluation.preferredBrand);
      }
      if (response.comparativeEvaluation.comments) {
        setComments(response.comparativeEvaluation.comments);
      }
    }
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
    return !questionnaire.questions.some(question => 
      brandEval?.[question.criterion]?.rating === null || 
      brandEval?.[question.criterion]?.rating === 0
    );
  };

  const canSubmit = () => {
    return questionnaire.brands.every(brand => isStepComplete(brand._id));
  };

  const handleSubmit = async (isDraft = false) => {
    const formattedAnswers = [];
    Object.entries(evaluations).forEach(([brandId, criteria]) => {
      Object.entries(criteria).forEach(([criterion, { rating, comment }]) => {
        if (rating || comment) {
          formattedAnswers.push({
            brand: brandId,
            criterion,
            rating: rating || 0,
            comments: comment
          });
        }
      });
    });

    const responseData = {
      answers: formattedAnswers,
      status: isDraft ? 'draft' : 'submitted'
    };

    if (!isDraft || preferredBrand || comments) {
      responseData.comparativeEvaluation = {
        ...(preferredBrand && { preferredBrand }),
        ...(comments && { comments })
      };
    }

    if (!isDraft) {
      const { isValid, errors } = validateResponse(responseData);
      if (!isValid) {
        setError(Object.values(errors).join('. '));
        return;
      }
    }

    setSubmitting(true);
    setError('');

    try {
      if (existingResponse) {
        await responses.update(existingResponse._id, responseData);
        showNotification(
          isDraft ? 'Draft saved successfully' : 'Evaluation updated successfully', 
          'success'
        );
      } else {
        await responses.submit(id, responseData);
        showNotification(
          isDraft ? 'Draft saved successfully' : 'Evaluation submitted successfully', 
          'success'
        );
      }
      if (!isDraft) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save evaluation');
      showNotification('Failed to save evaluation', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingResponse) return <LoadingSpinner />;
  if (!questionnaire) return <Alert severity="error">Questionnaire not found</Alert>;

  return (
    <Box maxWidth="md" mx="auto">
      <Paper sx={{ p: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              {questionnaire.title}
            </Typography>
            {existingResponse && (
              <Typography variant="subtitle1" color="text.secondary">
                {existingResponse.status === 'draft' ? 'Editing Draft' : 'Editing Response'}
              </Typography>
            )}
          </Box>
          <Button
            variant="outlined"
            onClick={() => handleSubmit(true)}
            disabled={submitting || questionnaire.status === 'closed'}
            startIcon={<Save />}
          >
            Save Draft
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Stepper nonLinear activeStep={activeStep} orientation="vertical">
          {questionnaire.brands.map((brand, index) => (
            <Step key={brand._id} completed={isStepComplete(brand._id)}>
              <StepLabel 
                error={activeStep === questionnaire.brands.length && !isStepComplete(brand._id)}
                onClick={() => setActiveStep(index)}
                sx={{ cursor: 'pointer' }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  <Typography variant="h6">{brand.name}</Typography>
                  {!isStepComplete(brand._id) && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ ml: 2 }}
                    >
                      (Incomplete)
                    </Typography>
                  )}
                </Box>
              </StepLabel>
              <StepContent>
                {questionnaire.questions.map(question => (
                  <RatingInput
                    key={question.criterion}
                    criterion={question.criterion}
                    description={question.description}
                    rating={evaluations[brand._id][question.criterion]?.rating || null}
                    comment={evaluations[brand._id][question.criterion]?.comment}
                    onChange={(c, field, value) => 
                      handleRatingChange(brand._id, c, field, value)}
                    disabled={questionnaire.status === 'closed'}
                  />
                ))}
                <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={() => setActiveStep(index + 1)}
                    sx={{ mt: 1 }}
                  >
                    {index === questionnaire.brands.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(index - 1)}
                    sx={{ mt: 1 }}
                    disabled={index === 0}
                  >
                    Back
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setActiveStep(questionnaire.brands.length)}
                    sx={{ mt: 1 }}
                  >
                    Skip to Final Evaluation
                  </Button>
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
            {!canSubmit() && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                Please complete all brand evaluations before submitting
              </Alert>
            )}
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
                onClick={() => handleSubmit(false)}
                disabled={submitting || !canSubmit() || questionnaire.status === 'closed'}
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