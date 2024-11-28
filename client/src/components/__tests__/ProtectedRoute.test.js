import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import ProtectedRoute from '../ProtectedRoute';

const MockComponent = () => <div>Protected Content</div>;

const renderProtectedRoute = (initialUser = null) => {
  const mockAuthContext = {
    user: initialUser,
    login: jest.fn(),
    logout: jest.fn()
  };

  return render(
    <AuthProvider value={mockAuthContext}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <MockComponent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
};

describe('ProtectedRoute', () => {
  it('renders protected content when user is authenticated', () => {
    renderProtectedRoute({ id: 1, role: 'client' });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    renderProtectedRoute(null);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('handles admin-only routes correctly', () => {
    render(
      <AuthProvider value={{ user: { id: 1, role: 'client' } }}>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <div>Admin Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
}); 