import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const joinQuestionnaire = (questionnaireId) => {
    if (socket) {
      socket.emit('join-questionnaire', questionnaireId);
    }
  };

  const leaveQuestionnaire = (questionnaireId) => {
    if (socket) {
      socket.emit('leave-questionnaire', questionnaireId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, joinQuestionnaire, leaveQuestionnaire }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext); 