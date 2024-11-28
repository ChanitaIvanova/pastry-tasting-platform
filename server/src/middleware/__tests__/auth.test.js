const jwt = require('jsonwebtoken');
const { auth, isAdmin } = require('../auth');
const User = require('../../models/User');

jest.mock('../../models/User');

describe('Auth Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction;

  beforeEach(() => {
    mockRequest = {
      header: jest.fn()
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
  });

  describe('auth middleware', () => {
    it('should reject requests without token', async () => {
      mockRequest.header.mockReturnValue(null);

      await auth(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'No token provided'
      });
    });

    it('should reject invalid token format', async () => {
      mockRequest.header.mockReturnValue('InvalidToken');

      await auth(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid token format'
      });
    });

    it('should reject expired tokens', async () => {
      const expiredToken = jwt.sign(
        { userId: 'user123' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '0s' }
      );

      mockRequest.header.mockReturnValue(`Bearer ${expiredToken}`);

      await auth(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Token expired'
      });
    });

    it('should authenticate valid tokens', async () => {
      const validToken = jwt.sign(
        { userId: 'user123' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const mockUser = {
        _id: 'user123',
        role: 'client'
      };

      User.findById.mockResolvedValue(mockUser);
      mockRequest.header.mockReturnValue(`Bearer ${validToken}`);

      await auth(mockRequest, mockResponse, nextFunction);

      expect(mockRequest.user).toEqual(mockUser);
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('isAdmin middleware', () => {
    it('should allow admin users', () => {
      mockRequest.user = { role: 'admin' };

      isAdmin(mockRequest, mockResponse, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should reject non-admin users', () => {
      mockRequest.user = { role: 'client' };

      isAdmin(mockRequest, mockResponse, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Admin access required'
      });
    });
  });
}); 