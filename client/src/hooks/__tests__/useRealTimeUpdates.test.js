import { renderHook } from '@testing-library/react-hooks';
import { useRealTimeUpdates } from '../useRealTimeUpdates';
import { useSocket } from '../../contexts/SocketContext';
import { useNotification } from '../../contexts/NotificationContext';

// Mock the socket context
jest.mock('../../contexts/SocketContext');
jest.mock('../../contexts/NotificationContext');

describe('useRealTimeUpdates', () => {
  const mockSocket = {
    on: jest.fn(),
    off: jest.fn()
  };

  const mockJoinQuestionnaire = jest.fn();
  const mockLeaveQuestionnaire = jest.fn();
  const mockShowNotification = jest.fn();

  beforeEach(() => {
    useSocket.mockImplementation(() => ({
      socket: mockSocket,
      joinQuestionnaire: mockJoinQuestionnaire,
      leaveQuestionnaire: mockLeaveQuestionnaire
    }));

    useNotification.mockImplementation(() => ({
      showNotification: mockShowNotification
    }));

    // Clear all mocks
    jest.clearAllMocks();
  });

  it('should join questionnaire room on mount', () => {
    const questionnaireId = 'test-id';
    renderHook(() => useRealTimeUpdates(questionnaireId));

    expect(mockJoinQuestionnaire).toHaveBeenCalledWith(questionnaireId);
  });

  it('should leave questionnaire room on unmount', () => {
    const questionnaireId = 'test-id';
    const { unmount } = renderHook(() => useRealTimeUpdates(questionnaireId));

    unmount();

    expect(mockLeaveQuestionnaire).toHaveBeenCalledWith(questionnaireId);
  });

  it('should register socket event listeners', () => {
    const questionnaireId = 'test-id';
    renderHook(() => useRealTimeUpdates(questionnaireId));

    expect(mockSocket.on).toHaveBeenCalledWith('questionnaire-updated', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('response-submitted', expect.any(Function));
  });

  it('should remove socket event listeners on unmount', () => {
    const questionnaireId = 'test-id';
    const { unmount } = renderHook(() => useRealTimeUpdates(questionnaireId));

    unmount();

    expect(mockSocket.off).toHaveBeenCalledWith('questionnaire-updated');
    expect(mockSocket.off).toHaveBeenCalledWith('response-submitted');
  });

  it('should call onUpdate callback when events are received', () => {
    const questionnaireId = 'test-id';
    const mockOnUpdate = jest.fn();

    renderHook(() => useRealTimeUpdates(questionnaireId, mockOnUpdate));

    // Simulate socket events
    const updateHandler = mockSocket.on.mock.calls.find(call => call[0] === 'questionnaire-updated')[1];
    updateHandler();

    const responseHandler = mockSocket.on.mock.calls.find(call => call[0] === 'response-submitted')[1];
    responseHandler();

    expect(mockOnUpdate).toHaveBeenCalledTimes(2);
    expect(mockShowNotification).toHaveBeenCalledTimes(2);
  });
}); 