const { Server } = require('socket.io');
const Client = require('socket.io-client');
const { createServer } = require('http');
const { initializeSocket, getIO, emitQuestionnaireUpdate, emitResponseSubmitted } = require('../socket');

describe('Socket Service', () => {
  let io, serverSocket, clientSocket, httpServer;
  const PORT = 3001;

  beforeAll((done) => {
    httpServer = createServer();
    io = initializeSocket(httpServer);
    httpServer.listen(PORT, () => {
      const clientOptions = {
        transports: ['websocket'],
        'force new connection': true,
        reconnection: false
      };
      clientSocket = new Client(`http://localhost:${PORT}`, clientOptions);
      io.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    if (clientSocket) clientSocket.close();
    if (httpServer) httpServer.close();
    if (io) io.close();
  });

  it('should initialize socket server', () => {
    expect(getIO()).toBeDefined();
  });

  it('should handle client connections', (done) => {
    expect(serverSocket).toBeDefined();
    done();
  });

  it('should handle joining questionnaire rooms', (done) => {
    const questionnaireId = 'test-123';
    
    clientSocket.emit('join-questionnaire', questionnaireId);
    
    setTimeout(() => {
      const rooms = Array.from(serverSocket.rooms);
      expect(rooms).toContain(`questionnaire-${questionnaireId}`);
      done();
    }, 50);
  });

  it('should handle leaving questionnaire rooms', (done) => {
    const questionnaireId = 'test-123';
    
    clientSocket.emit('join-questionnaire', questionnaireId);
    clientSocket.emit('leave-questionnaire', questionnaireId);
    
    setTimeout(() => {
      const rooms = Array.from(serverSocket.rooms);
      expect(rooms).not.toContain(`questionnaire-${questionnaireId}`);
      done();
    }, 50);
  });

  it('should emit questionnaire updates', (done) => {
    const questionnaireId = 'test-123';
    
    clientSocket.emit('join-questionnaire', questionnaireId);
    
    clientSocket.on('questionnaire-updated', () => {
      done();
    });
    
    emitQuestionnaireUpdate(questionnaireId);
  });

  it('should emit response submissions', (done) => {
    const questionnaireId = 'test-123';
    
    clientSocket.emit('join-questionnaire', questionnaireId);
    
    clientSocket.on('response-submitted', () => {
      done();
    });
    
    emitResponseSubmitted(questionnaireId);
  });

  it('should handle disconnections', (done) => {
    serverSocket.on('disconnect', () => {
      done();
    });
    clientSocket.close();
  });
}); 