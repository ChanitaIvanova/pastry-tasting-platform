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
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { questionnaires, responses } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import RatingInput from '../components/RatingInput';
import { validateResponse } from '../utils/validation';
import { useNotification } from '../contexts/NotificationContext';
import { Save } from '@mui/icons-material';
import BrandComment from '../components/BrandComment';

const QUESTION_TYPES = {
  RATING: 'rating',
  SINGLE_SELECT: 'single-select',
  TEXT: 'text'
};

const getQuestionId = (question) => question._id?.toString() || question.criterion;

const getRatingQuestions = (questions = []) =>
  questions.filter(question => (question.type || QUESTION_TYPES.RATING) === QUESTION_TYPES.RATING);

const getCustomQuestions = (questions = []) =>
  questions.filter(question => (question.type || QUESTION_TYPES.RATING) !== QUESTION_TYPES.RATING);

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
  const [loadingResponse, setLoadingResponse] = useState(true);
  const [brandComments, setBrandComments] = useState({});
  const [customAnswers, setCustomAnswers] = useState({});
  const [expandedSteps, setExpandedSteps] = useState(new Set());

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
      const ratingQuestions = getRatingQuestions(response.data.questions);
      response.data.brands.forEach(brand => {
        initial[brand._id] = {};
        ratingQuestions.forEach(question => {
          initial[brand._id][question.criterion] = { rating: null, comment: '' };
        });
      });
      setEvaluations(initial);
      const customInitial = {};
      getCustomQuestions(response.data.questions).forEach(question => {
        customInitial[getQuestionId(question)] = '';
      });
      setCustomAnswers(customInitial);
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
      getRatingQuestions(questionnaire.questions).forEach(question => {
        evaluationsData[brand._id][question.criterion] = { rating: null };
      });
    });

    response.answers.forEach(answer => {
      if (!evaluationsData[answer.brand]) {
        evaluationsData[answer.brand] = {};
      }
      evaluationsData[answer.brand][answer.criterion] = {
        rating: answer.rating || null
      };
    });

    setEvaluations(evaluationsData);

    const customAnswersData = {};
    getCustomQuestions(questionnaire.questions).forEach(question => {
      customAnswersData[getQuestionId(question)] = '';
    });

    if (response.customAnswers) {
      response.customAnswers.forEach(answer => {
        const questionKey = answer.question?.toString();
        if (questionKey && Object.prototype.hasOwnProperty.call(customAnswersData, questionKey)) {
          customAnswersData[questionKey] = answer.value;
        }
      });
    }
    setCustomAnswers(customAnswersData);

    const brandCommentsData = {};
    if (response.brandComments) {
      response.brandComments.forEach(comment => {
        brandCommentsData[comment.brand] = comment.comment;
      });
    }
    setBrandComments(brandCommentsData);
    
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

  const handleCustomAnswerChange = (questionId, value, maxLength) => {
    const nextValue =
      typeof maxLength === 'number' && typeof value === 'string'
        ? value.slice(0, maxLength)
        : value;

    setCustomAnswers(prev => ({
      ...prev,
      [questionId]: nextValue
    }));
  };

  const isStepComplete = (brandId) => {
    if (!questionnaire) return false;
    const brandEval = evaluations[brandId];
    const ratingQuestions = getRatingQuestions(questionnaire.questions);
    if (ratingQuestions.length === 0) return true;

    return ratingQuestions.every(question => {
      const rating = brandEval?.[question.criterion]?.rating;
      return rating !== null && rating !== undefined && rating !== 0;
    });
  };

  const canSubmit = () => {
    if (!questionnaire) return false;
    return questionnaire.brands.every(brand => isStepComplete(brand._id));
  };

  const handleSubmit = async (isDraft = false) => {
    const formattedAnswers = [];
    const formattedBrandComments = [];
    
    Object.entries(evaluations).forEach(([brandId, criteria]) => {
      Object.entries(criteria).forEach(([criterion, { rating }]) => {
        if (rating) {
          formattedAnswers.push({
            brand: brandId,
            criterion,
            rating
          });
        }
      });
    });

    Object.entries(brandComments).forEach(([brandId, comment]) => {
      if (comment) {
        formattedBrandComments.push({
          brand: brandId,
          comment
        });
      }
    });

    const formattedCustomAnswers = Object.entries(customAnswers).reduce((acc, [questionId, value]) => {
      const trimmedValue = typeof value === 'string' ? value.trim() : '';
      if (trimmedValue) {
        acc.push({ question: questionId, value: trimmedValue });
      }
      return acc;
    }, []);

    const responseData = {
      answers: formattedAnswers,
      brandComments: formattedBrandComments,
      status: isDraft ? 'draft' : 'submitted',
      customAnswers: formattedCustomAnswers
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

  const handleStepClick = (index) => {
    setExpandedSteps(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(index)) {
        newExpanded.delete(index);
      } else {
        newExpanded.add(index);
      }
      return newExpanded;
    });
  };

  if (loading || loadingResponse) return <LoadingSpinner />;
  if (!questionnaire) return <Alert severity="error">Questionnaire not found</Alert>;

  const ratingQuestions = getRatingQuestions(questionnaire.questions);
  const customQuestions = getCustomQuestions(questionnaire.questions);

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
                onClick={() => handleStepClick(index)}
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
              <StepContent TransitionProps={{ in: expandedSteps.has(index) }}>
                {ratingQuestions.map(question => (
                  <RatingInput
                    key={question.criterion}
                    criterion={question.criterion}
                    description={question.description}
                    rating={evaluations[brand._id][question.criterion]?.rating || null}
                    onChange={(c, field, value) => 
                      handleRatingChange(brand._id, c, field, value)}
                    disabled={questionnaire.status === 'closed'}
                  />
                ))}
                <BrandComment
                  brandName={brand.name}
                  comment={brandComments[brand._id]}
                  onChange={(value) => setBrandComments(prev => ({
                    ...prev,
                    [brand._id]: value
                  }))}
                  disabled={questionnaire.status === 'closed'}
                />
                <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setActiveStep(index + 1);
                      handleStepClick(index); // Collapse current step
                      if (index < questionnaire.brands.length - 1) {
                        handleStepClick(index + 1); // Expand next step
                      }
                    }}
                    sx={{ mt: 1 }}
                  >
                    {index === questionnaire.brands.length - 1 ? 'Finish' : 'Continue'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setActiveStep(index - 1);
                      handleStepClick(index); // Collapse current step
                      if (index > 0) {
                        handleStepClick(index - 1); // Expand previous step
                      }
                    }}
                    sx={{ mt: 1 }}
                    disabled={index === 0}
                  >
                    Back
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setActiveStep(questionnaire.brands.length);
                      handleStepClick(index); // Collapse current step
                    }}
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
            {customQuestions.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Additional Questions
                </Typography>
                {customQuestions.map(question => {
                  const questionId = getQuestionId(question);
                  const currentValue = customAnswers[questionId] || '';
                  const questionType = question.type || QUESTION_TYPES.RATING;

                  if (questionType === QUESTION_TYPES.SINGLE_SELECT) {
                    const options = question.options || [];

                    if (options.length <= 5) {
                      return (
                        <Box key={questionId} sx={{ mb: 2 }}>
                          <Typography variant="subtitle1" gutterBottom>
                            {question.description}
                          </Typography>
                          <RadioGroup
                            value={currentValue}
                            onChange={(e) => handleCustomAnswerChange(questionId, e.target.value)}
                          >
                            {options.map(option => (
                              <FormControlLabel
                                key={option}
                                value={option}
                                control={<Radio />}
                                label={option}
                                disabled={questionnaire.status === 'closed'}
                              />
                            ))}
                          </RadioGroup>
                        </Box>
                      );
                    }

                    const labelId = `custom-select-${questionId}`;
                    return (
                      <FormControl
                        key={questionId}
                        fullWidth
                        sx={{ mb: 2 }}
                        disabled={questionnaire.status === 'closed'}
                      >
                        <InputLabel id={labelId}>{question.description}</InputLabel>
                        <Select
                          labelId={labelId}
                          value={currentValue}
                          label={question.description}
                          onChange={(e) => handleCustomAnswerChange(questionId, e.target.value)}
                        >
                          {options.map(option => (
                            <MenuItem key={option} value={option}>
                              {option}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    );
                  }

                  const maxLength = question.maxLength || 500;
                  return (
                    <TextField
                      key={questionId}
                      fullWidth
                      multiline
                      minRows={3}
                      label={question.description}
                      value={currentValue}
                      onChange={(e) => handleCustomAnswerChange(questionId, e.target.value, maxLength)}
                      disabled={questionnaire.status === 'closed'}
                      inputProps={{ maxLength }}
                      helperText={`${currentValue.length}/${maxLength} characters`}
                      sx={{ mb: 3 }}
                    />
                  );
                })}
              </Box>
            )}
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