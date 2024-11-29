import axios from 'axios';

const baseUrl = process.env.NODE_ENV === 'production' 
? process.env.REACT_APP_API_URL 
: '';

const api = axios.create({
  baseURL: baseUrl + '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData)
};

export const questionnaires = {
  getAll: () => api.get('/questionnaires'),
  getOne: (id) => api.get(`/questionnaires/${id}`),
  create: (data) => api.post('/questionnaires', data),
  update: (id, data) => api.put(`/questionnaires/${id}`, data),
  close: (id) => api.patch(`/questionnaires/${id}/close`),
  delete: (id) => api.delete(`/questionnaires/${id}`),
  duplicate: (id) => api.post(`/questionnaires/${id}/duplicate`)
};

export const responses = {
  submit: (questionnaireId, data) => api.post(`/responses/${questionnaireId}`, data),
  getMyResponses: () => api.get('/responses/my-responses'),
  getQuestionnaireResponses: (questionnaireId) => 
    api.get(`/responses/questionnaire/${questionnaireId}`),
  getStatistics: (questionnaireId) => 
    api.get(`/responses/statistics/${questionnaireId}`),
  update: (responseId, data) => api.put(`/responses/${responseId}`, data),
  getOne: (responseId) => api.get(`/responses/${responseId}`)
};

export const activityLogs = {
  getAll: (params) => api.get('/activity-logs', { params }),
  getMyActivities: (params) => api.get('/activity-logs/my-activities', { params })
};

export default api; 