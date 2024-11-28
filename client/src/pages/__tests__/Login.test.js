import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';
import Login from '../Login';
import { auth } from '../../services/api';

jest.mock('../../services/api');

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Login />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    auth.login.mockClear();
  });

  it('renders login form', () => {
    renderLogin();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    auth.login.mockResolvedValueOnce({
      data: {
        token: 'fake-token',
        user: { id: 1, username: 'testuser', role: 'client' }
      }
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(auth.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('displays error message on failed login', async () => {
    auth.login.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials' } }
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('disables form submission while loading', async () => {
    auth.login.mockImplementationOnce(() => new Promise(() => {}));

    renderLogin();

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
  });
}); 