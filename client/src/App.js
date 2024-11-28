import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import theme from './theme';
import { NotificationProvider } from './contexts/NotificationContext';
import { SocketProvider } from './contexts/SocketContext';
import { QueryClientProvider } from 'react-query';
import { queryClient } from './services/queryClient';

import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Questionnaire from './pages/Questionnaire';
import QuestionnaireForm from './pages/QuestionnaireForm';
import Statistics from './pages/Statistics';
import ProtectedRoute from './components/ProtectedRoute';
import QuestionnaireEdit from './pages/QuestionnaireEdit';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <NotificationProvider>
            <SocketProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route element={<Layout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/questionnaires/new"
                      element={
                        <ProtectedRoute adminOnly>
                          <QuestionnaireForm />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/questionnaires/:id/edit"
                      element={
                        <ProtectedRoute adminOnly>
                          <QuestionnaireEdit />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/questionnaires/:id"
                      element={
                        <ProtectedRoute>
                          <Questionnaire />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/questionnaires/:id/statistics"
                      element={
                        <ProtectedRoute adminOnly>
                          <Statistics />
                        </ProtectedRoute>
                      }
                    />
                  </Route>
                </Routes>
              </BrowserRouter>
            </SocketProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 