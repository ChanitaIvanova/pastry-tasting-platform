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
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Assessment,
  Edit,
  Lock,
  LockOpen,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Assessment as AssessmentIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { questionnaires, responses } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../contexts/NotificationContext';
import ConfirmationDialog from '../components/ConfirmationDialog';
import TablePagination from '../components/TablePagination';
import SearchFilters from '../components/SearchFilters';
import { startOfDay, endOfDay, isWithinInterval } from 'date-fns';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questionnaireList, setQuestionnaireList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { showNotification } = useNotification();
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    questionnaireId: null,
    action: null
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    fromDate: null,
    toDate: null
  });
  const [questionnaireResponses, setQuestionnaireResponses] = useState({});
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState(null);

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
      questionnaireId: id,
      action: 'close'
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
      setConfirmDialog({ open: false, questionnaireId: null, action: null });
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

  const handleOpenActionMenu = (event, questionnaireId) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedQuestionnaireId(questionnaireId);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setSelectedQuestionnaireId(null);
  };

  const handleDuplicate = async (questionnaireId) => {
    try {
      await questionnaires.duplicate(questionnaireId);
      showNotification('Questionnaire duplicated successfully', 'success');
      fetchQuestionnaires();
      handleCloseActionMenu();
    } catch (err) {
      showNotification('Failed to duplicate questionnaire', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await questionnaires.delete(confirmDialog.questionnaireId);
      showNotification('Questionnaire deleted successfully', 'success');
      fetchQuestionnaires();
      setConfirmDialog({ open: false, questionnaireId: null, action: null });
    } catch (err) {
      showNotification('Failed to delete questionnaire', 'error');
      setConfirmDialog({ open: false, questionnaireId: null, action: null });
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

      <Grid container spacing={3}>
        {paginatedQuestionnaires.map((questionnaire) => (
          <Grid item xs={12} md={6} lg={4} key={questionnaire._id}>
            <Card sx={{ position: 'relative' }}>
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2
                }}>
                  {/* Title */}
                  <Tooltip title={questionnaire.title} placement="top">
                    <Typography 
                      variant="h6" 
                      component="h2"
                      sx={{ 
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {questionnaire.title}
                    </Typography>
                  </Tooltip>

                  {/* Badges and Menu */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    flexShrink: 0
                  }}>
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
                    {user.role === 'admin' && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleOpenActionMenu(e, questionnaire._id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                {/* Rest of the content */}
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography color="text.secondary">
                    Brands: {questionnaire.brands.length}
                  </Typography>

                  {user.role === 'client' && (
                    <Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/questionnaires/${questionnaire._id}`)}
                        startIcon={<Edit />}
                      >
                        Evaluate
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
            {user.role === 'admin' && (
              <Menu
                anchorEl={actionMenuAnchor}
                open={Boolean(actionMenuAnchor) && selectedQuestionnaireId === questionnaire._id}
                onClose={handleCloseActionMenu}
              >
                <MenuItem 
                  onClick={() => {
                    navigate(`/questionnaires/${questionnaire._id}/edit`);
                    handleCloseActionMenu();
                  }}
                >
                  <ListItemIcon>
                    <EditIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem 
                  onClick={() => handleDuplicate(questionnaire._id)}
                >
                  <ListItemIcon>
                    <ContentCopyIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Duplicate</ListItemText>
                </MenuItem>
                <MenuItem 
                  onClick={() => {
                    navigate(`/questionnaires/${questionnaire._id}/details`);
                    handleCloseActionMenu();
                  }}
                >
                  <ListItemIcon>
                    <VisibilityIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>View Details</ListItemText>
                </MenuItem>
                <MenuItem 
                  onClick={() => {
                    navigate(`/questionnaires/${questionnaire._id}/statistics`);
                    handleCloseActionMenu();
                  }}
                >
                  <ListItemIcon>
                    <AssessmentIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Statistics</ListItemText>
                </MenuItem>
                {questionnaire.status === 'open' && (
                  <MenuItem 
                    onClick={() => {
                      handleCloseQuestionnaire(questionnaire._id);
                      handleCloseActionMenu();
                    }}
                  >
                    <ListItemIcon>
                      <CloseIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Close</ListItemText>
                  </MenuItem>
                )}
                <MenuItem 
                  onClick={() => {
                    setConfirmDialog({
                      open: true,
                      questionnaireId: questionnaire._id,
                      action: 'delete'
                    });
                    handleCloseActionMenu();
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <ListItemIcon>
                    <DeleteIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Delete</ListItemText>
                </MenuItem>
              </Menu>
            )}
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
        title={confirmDialog.action === 'delete' ? "Delete Questionnaire" : "Close Questionnaire"}
        message={
          confirmDialog.action === 'delete' 
            ? "Are you sure you want to delete this questionnaire? This action cannot be undone."
            : "Are you sure you want to close this questionnaire? This action cannot be undone."
        }
        onConfirm={confirmDialog.action === 'delete' ? handleDelete : handleConfirmClose}
        onCancel={() => setConfirmDialog({ open: false, questionnaireId: null, action: null })}
        confirmText={confirmDialog.action === 'delete' ? "Delete" : "Close"}
        severity={confirmDialog.action === 'delete' ? "error" : "warning"}
      />
    </Box>
  );
};

export default Dashboard; 