const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const { createTestUser, generateTestToken } = require('./helpers/auth');
const { initializeSocket } = require('../services/socket');

describe('Socket.io Server', () => {
  let io, serverSocket, clientSocket, httpServer;

  beforeAll((done) => {
    httpServer = createServer();
    io = initializeSocket(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
    httpServer.close();
  });

  test('should handle questionnaire room joining', (done) => {
    const questionnaireId = 'test-questionnaire-id';
    
    clientSocket.emit('join-questionnaire', questionnaireId);
    
    setTimeout(() => {
      const rooms = Array.from(serverSocket.rooms);
      expect(rooms).toContain(`questionnaire-${questionnaireId}`);
      done();
    }, 50);
  });

  test('should handle questionnaire room leaving', (done) => {
    const questionnaireId = 'test-questionnaire-id';
    
    clientSocket.emit('join-questionnaire', questionnaireId);
    clientSocket.emit('leave-questionnaire', questionnaireId);
    
    setTimeout(() => {
      const rooms = Array.from(serverSocket.rooms);
      expect(rooms).not.toContain(`questionnaire-${questionnaireId}`);
      done();
    }, 50);
  });

  test('should broadcast questionnaire updates', (done) => {
    const questionnaireId = 'test-questionnaire-id';
    
    clientSocket.emit('join-questionnaire', questionnaireId);
    
    clientSocket.on('questionnaire-updated', () => {
      done();
    });
    
    setTimeout(() => {
      io.to(`questionnaire-${questionnaireId}`).emit('questionnaire-updated');
    }, 50);
  });

  test('should broadcast new responses', (done) => {
    const questionnaireId = 'test-questionnaire-id';
    
    clientSocket.emit('join-questionnaire', questionnaireId);
    
    clientSocket.on('response-submitted', () => {
      done();
    });
    
    setTimeout(() => {
      io.to(`questionnaire-${questionnaireId}`).emit('response-submitted');
    }, 50);
  });
}); 