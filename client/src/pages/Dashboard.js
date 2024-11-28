import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  IconButton,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Assessment,
  Edit,
  Lock,
  LockOpen
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { questionnaires, responses } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import ConfirmationDialog from '../components/ConfirmationDialog';
import TablePagination from '../components/TablePagination';
import SearchFilters from '../components/SearchFilters';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import BatchOperations from '../components/BatchOperations';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questionnaireList, setQuestionnaireList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    questionnaireId: null
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    fromDate: null,
    toDate: null
  });
  const [selectedQuestionnaires, setSelectedQuestionnaires] = useState([]);
  const [questionnaireResponses, setQuestionnaireResponses] = useState({});

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  useEffect(() => {
    if (user.role === 'client') {
      const fetchResponses = async () => {
        try {
          const response = await responses.getMyResponses();
          const responseMap = response.data.reduce((acc, resp) => {
            acc[resp.questionnaire._id] = resp;
            return acc;
          }, {});
          setQuestionnaireResponses(responseMap);
        } catch (err) {
          console.error('Failed to fetch responses:', err);
        }
      };
      fetchResponses();
    }
  }, [user.role]);

  const fetchQuestionnaires = async () => {
    try {
      const response = await questionnaires.getAll();
      setQuestionnaireList(response.data);
    } catch (err) {
      setError('Failed to fetch questionnaires');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQuestionnaire = async (id) => {
    setConfirmDialog({
      open: true,
      questionnaireId: id
    });
  };

  const handleConfirmClose = async () => {
    try {
      await questionnaires.close(confirmDialog.questionnaireId);
      showNotification('Questionnaire closed successfully', 'success');
      fetchQuestionnaires();
    } catch (err) {
      setError('Failed to close questionnaire');
      showNotification('Failed to close questionnaire', 'error');
    } finally {
      setConfirmDialog({ open: false, questionnaireId: null });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filterQuestionnaires = (questionnaires) => {
    return questionnaires.filter(questionnaire => {
      // Search filter
      const matchesSearch = questionnaire.title
        .toLowerCase()
        .includes(filters.search.toLowerCase());

      // Status filter
      const matchesStatus = filters.status === 'all' || 
        questionnaire.status === filters.status;

      // Date filter
      let matchesDate = true;
      if (filters.fromDate || filters.toDate) {
        const createdAt = new Date(questionnaire.createdAt);
        if (filters.fromDate && filters.toDate) {
          matchesDate = isWithinInterval(createdAt, {
            start: startOfDay(filters.fromDate),
            end: endOfDay(filters.toDate)
          });
        } else if (filters.fromDate) {
          matchesDate = createdAt >= startOfDay(filters.fromDate);
        } else if (filters.toDate) {
          matchesDate = createdAt <= endOfDay(filters.toDate);
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const filteredQuestionnaires = filterQuestionnaires(questionnaireList);
  const paginatedQuestionnaires = filteredQuestionnaires
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSelectQuestionnaire = (questionnaireId) => {
    setSelectedQuestionnaires(prev => {
      if (prev.includes(questionnaireId)) {
        return prev.filter(id => id !== questionnaireId);
      }
      return [...prev, questionnaireId];
    });
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedQuestionnaires(filteredQuestionnaires.map(q => q._id));
    } else {
      setSelectedQuestionnaires([]);
    }
  };

  const handleBatchClose = async () => {
    try {
      await Promise.all(
        selectedQuestionnaires.map(id => questionnaires.close(id))
      );
      showNotification('Selected questionnaires closed successfully', 'success');
      fetchQuestionnaires();
      setSelectedQuestionnaires([]);
    } catch (err) {
      showNotification('Failed to close selected questionnaires', 'error');
    }
  };

  const handleBatchExport = () => {
    const selectedData = filteredQuestionnaires.filter(q => 
      selectedQuestionnaires.includes(q._id)
    );
    exportToExcel(selectedData, 'questionnaires-export');
    showNotification('Data exported successfully', 'success');
  };

  const handleBatchDelete = async () => {
    try {
      await Promise.all(
        selectedQuestionnaires.map(id => questionnaires.delete(id))
      );
      showNotification('Selected questionnaires deleted successfully', 'success');
      fetchQuestionnaires();
      setSelectedQuestionnaires([]);
    } catch (err) {
      showNotification('Failed to delete selected questionnaires', 'error');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        {user.role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/questionnaires/new')}
          >
            New Questionnaire
          </Button>
        )}
      </Box>

      <SearchFilters
        filters={filters}
        onFilterChange={setFilters}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {user.role === 'admin' && selectedQuestionnaires.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <BatchOperations
            selectedItems={selectedQuestionnaires}
            onCloseQuestionnaires={handleBatchClose}
            onExport={handleBatchExport}
            onDelete={handleBatchDelete}
          />
        </Box>
      )}

      <Grid container spacing={3}>
        {paginatedQuestionnaires.map((questionnaire) => (
          <Grid item xs={12} md={6} lg={4} key={questionnaire._id}>
            <Card>
              {user.role === 'admin' && (
                <Box sx={{ p: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedQuestionnaires.includes(questionnaire._id)}
                        onChange={() => handleSelectQuestionnaire(questionnaire._id)}
                      />
                    }
                    label="Select"
                  />
                </Box>
              )}
              <CardContent>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" component="h2">
                    {questionnaire.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {user.role === 'client' && questionnaireResponses[questionnaire._id] && (
                      <Chip
                        label={questionnaireResponses[questionnaire._id].status === 'draft' ? 'Draft' : 'Submitted'}
                        color={questionnaireResponses[questionnaire._id].status === 'draft' ? 'warning' : 'success'}
                        size="small"
                      />
                    )}
                    <Chip
                      label={questionnaire.status}
                      color={questionnaire.status === 'open' ? 'success' : 'default'}
                      size="small"
                      icon={questionnaire.status === 'open' ? <LockOpen /> : <Lock />}
                    />
                  </Box>
                </Box>
                
                <Typography color="text.secondary" gutterBottom>
                  Brands: {questionnaire.brands.length}
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  {user.role === 'client' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/questionnaires/${questionnaire._id}`)}
                      startIcon={<Edit />}
                    >
                      Evaluate
                    </Button>
                  )}
                  
                  {user.role === 'admin' && (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/questionnaires/${questionnaire._id}/edit`)}
                        startIcon={<Edit />}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/questionnaires/${questionnaire._id}/details`)}
                        startIcon={<Assessment />}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/questionnaires/${questionnaire._id}/statistics`)}
                        startIcon={<Assessment />}
                      >
                        Statistics
                      </Button>
                      {questionnaire.status === 'open' && (
                        <Button
                          variant="outlined"
                          color="secondary"
                          size="small"
                          onClick={() => handleCloseQuestionnaire(questionnaire._id)}
                        >
                          Close
                        </Button>
                      )}
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredQuestionnaires.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <TablePagination
            count={filteredQuestionnaires.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Box>
      )}

      {filteredQuestionnaires.length === 0 && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="text.secondary">
            {questionnaireList.length === 0 
              ? 'No questionnaires available.'
              : 'No questionnaires match your filters.'}
          </Typography>
        </Box>
      )}

      <ConfirmationDialog
        open={confirmDialog.open}
        title="Close Questionnaire"
        message="Are you sure you want to close this questionnaire? This action cannot be undone."
        onConfirm={handleConfirmClose}
        onCancel={() => setConfirmDialog({ open: false, questionnaireId: null })}
        confirmText="Close Questionnaire"
      />
    </Box>
  );
};

export default Dashboard; 