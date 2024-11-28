import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useNotification } from '../contexts/NotificationContext';

export const useRealTimeUpdates = (questionnaireId, onUpdate) => {
  const { socket, joinQuestionnaire, leaveQuestionnaire } = useSocket();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (socket && questionnaireId) {
      joinQuestionnaire(questionnaireId);

      socket.on('questionnaire-updated', () => {
        showNotification('Questionnaire has been updated', 'info');
        onUpdate?.();
      });

      socket.on('response-submitted', () => {
        showNotification('New response submitted', 'info');
        onUpdate?.();
      });

      return () => {
        leaveQuestionnaire(questionnaireId);
        socket.off('questionnaire-updated');
        socket.off('response-submitted');
      };
    }
  }, [socket, questionnaireId]);
}; 