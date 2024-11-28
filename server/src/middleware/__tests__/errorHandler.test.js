const errorHandler = require('../errorHandler');
const mongoose = require('mongoose');

describe('Error Handler Middleware', () => {
  let mockRequest;
  let mockResponse;
  let nextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('handles mongoose validation errors', () => {
    const validationError = new mongoose.Error.ValidationError();
    validationError.errors = {
      field1: { message: 'Field1 is required' },
      field2: { message: 'Field2 is invalid' }
    };

    errorHandler(validationError, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Validation Error',
      errors: {
        field1: 'Field1 is required',
        field2: 'Field2 is invalid'
      }
    });
  });

  it('handles mongoose cast errors', () => {
    const castError = new mongoose.Error.CastError('ObjectId', 'invalid-id', 'id');

    errorHandler(castError, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid ID format'
    });
  });

  it('handles duplicate key errors', () => {
    const duplicateError = {
      name: 'MongoError',
      code: 11000,
      keyValue: { email: 'test@example.com' }
    };

    errorHandler(duplicateError, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Duplicate key error',
      field: 'email'
    });
  });

  it('handles jwt errors', () => {
    const jwtError = new Error('jwt expired');
    jwtError.name = 'JsonWebTokenError';

    errorHandler(jwtError, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Invalid or expired token'
    });
  });

  it('handles generic errors', () => {
    const genericError = new Error('Something went wrong');

    errorHandler(genericError, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Internal Server Error'
    });
  });

  it('handles errors with custom status codes', () => {
    const customError = new Error('Custom error');
    customError.statusCode = 403;

    errorHandler(customError, mockRequest, mockResponse, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Custom error'
    });
  });
}); 