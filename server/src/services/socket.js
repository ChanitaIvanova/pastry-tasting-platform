const { Server } = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-questionnaire', (questionnaireId) => {
      socket.join(`questionnaire-${questionnaireId}`);
    });

    socket.on('leave-questionnaire', (questionnaireId) => {
      socket.leave(`questionnaire-${questionnaireId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const emitQuestionnaireUpdate = (questionnaireId) => {
  if (io) {
    io.to(`questionnaire-${questionnaireId}`).emit('questionnaire-updated');
  }
};

const emitResponseSubmitted = (questionnaireId) => {
  if (io) {
    io.to(`questionnaire-${questionnaireId}`).emit('response-submitted');
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitQuestionnaireUpdate,
  emitResponseSubmitted
}; 