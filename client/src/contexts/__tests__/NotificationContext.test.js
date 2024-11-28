import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { NotificationProvider, useNotification } from '../NotificationContext';

const TestComponent = () => {
  const { showNotification } = useNotification();

  return (
    <button onClick={() => showNotification('Test message', 'success')}>
      Show Notification
    </button>
  );
};

describe('NotificationContext', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should show and auto-hide notification', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Click button to show notification
    screen.getByRole('button').click();

    // Check if notification is shown
    expect(screen.getByText('Test message')).toBeInTheDocument();

    // Fast-forward timers
    act(() => {
      jest.advanceTimersByTime(6000);
    });

    // Check if notification is hidden
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('should display different severity levels', () => {
    const TestSeverities = () => {
      const { showNotification } = useNotification();
      return (
        <>
          <button onClick={() => showNotification('Success', 'success')}>Success</button>
          <button onClick={() => showNotification('Error', 'error')}>Error</button>
          <button onClick={() => showNotification('Warning', 'warning')}>Warning</button>
          <button onClick={() => showNotification('Info', 'info')}>Info</button>
        </>
      );
    };

    render(
      <NotificationProvider>
        <TestSeverities />
      </NotificationProvider>
    );

    // Test each severity
    screen.getByText('Success').click();
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardSuccess');

    screen.getByText('Error').click();
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardError');

    screen.getByText('Warning').click();
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardWarning');

    screen.getByText('Info').click();
    expect(screen.getByRole('alert')).toHaveClass('MuiAlert-standardInfo');
  });
}); 