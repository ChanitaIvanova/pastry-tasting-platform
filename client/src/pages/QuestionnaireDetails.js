import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Button,
  Collapse,
  Divider,
  Alert,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import { questionnaires, responses } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const QUESTION_TYPES = {
  RATING: 'rating',
  SINGLE_SELECT: 'single-select',
  TEXT: 'text'
};

const UserResponse = ({ response, questionnaire }) => {
  const [expanded, setExpanded] = useState(false);
  const customQuestions = questionnaire.questions.filter(
    question => (question.type || QUESTION_TYPES.RATING) !== QUESTION_TYPES.RATING
  );
  const customAnswersMap = new Map(
    (response.customAnswers || []).map(answer => [answer.question?.toString(), answer.value])
  );

  const formatUserCriteriaData = (criterion) => {
    const brandData = questionnaire.brands.map(brand => {
      const answer = response.answers.find(
        a => a.brand.toString() === brand._id.toString() && a.criterion === criterion
      );
      return {
        name: brand.name,
        rating: answer ? answer.rating : 0
      };
    });
    return brandData;
  };

  return (
    <>
      <ListItem>
        <ListItemText
          primary={response.user.username}
          secondary={`Submitted: ${new Date(response.createdAt).toLocaleDateString()}`}
        />
        <ListItemSecondaryAction>
          <Button
            onClick={() => setExpanded(!expanded)}
            startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {expanded ? 'Hide Details' : 'Show Details'}
          </Button>
        </ListItemSecondaryAction>
      </ListItem>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 4, pr: 4, pb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Individual Ratings
          </Typography>
          <Grid container spacing={3}>
            {questionnaire.questions.map(question => (
              <Grid item xs={12} md={6} key={question.criterion}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ textTransform: 'capitalize' }}>
                    {question.criterion}
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={formatUserCriteriaData(question.criterion)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Bar dataKey="rating" fill="#8884d8" name="Rating" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Preferred Brand: {
              questionnaire.brands.find(
                b => b._id.toString() === response.comparativeEvaluation.preferredBrand.toString()
              )?.name
            }
          </Typography>
          {response.comparativeEvaluation.comments && (
            <Typography variant="body2" color="text.secondary">
              Comments: {response.comparativeEvaluation.comments}
            </Typography>
          )}
          {customQuestions.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Additional Responses
              </Typography>
              {customQuestions.map(question => {
                const questionId = question._id?.toString();
                const answer = questionId ? customAnswersMap.get(questionId) : undefined;
                return (
                  <Box key={questionId || question.criterion} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">
                      {question.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {answer || 'No response provided'}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Collapse>
      <Divider />
    </>
  );
};

const QuestionnaireDetails = () => {
  const { id } = useParams();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [questionnaireResponses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [questionnaireRes, responsesRes] = await Promise.all([
        questionnaires.getOne(id),
        responses.getQuestionnaireResponses(id)
      ]);
      setQuestionnaire(questionnaireRes.data);
      setResponses(responsesRes.data);
    } catch (err) {
      setError('Failed to fetch questionnaire details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!questionnaire) return <Alert severity="error">Questionnaire not found</Alert>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {questionnaire.title} - Responses
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ mt: 3 }}>
        <List>
          {questionnaireResponses.length === 0 ? (
            <ListItem>
              <ListItemText primary="No responses yet" />
            </ListItem>
          ) : (
            questionnaireResponses.map(response => (
              <UserResponse
                key={response._id}
                response={response}
                questionnaire={questionnaire}
              />
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default QuestionnaireDetails; 