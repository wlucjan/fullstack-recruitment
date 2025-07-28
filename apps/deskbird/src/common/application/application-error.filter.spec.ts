import { ApplicationErrorFilter } from './application-error.filter';
import { ApplicationError } from './application.error';

describe('ApplicationErrorFilter', () => {
  let filter: ApplicationErrorFilter;
  let mockResponse: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new ApplicationErrorFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    };
  });

  describe('mapToHttpException', () => {
    it('should map CONFLICT errors to ConflictException', () => {
      const exception = new ApplicationError(
        'USER_ERROR.CONFLICT.EMAIL_ALREADY_EXISTS',
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 409,
        message: 'Conflict occurred',
        error: 'ConflictException',
      });
    });

    it('should map BAD_REQUEST errors to BadRequestException', () => {
      const exception = new ApplicationError(
        'USER_ERROR.BAD_REQUEST.EMAIL_INVALID',
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'Bad request',
        error: 'BadRequestException',
      });
    });

    it('should map NOT_FOUND errors to NotFoundException', () => {
      const exception = new ApplicationError('USER_ERROR.NOT_FOUND');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 404,
        message: 'Resource not found',
        error: 'NotFoundException',
      });
    });

    it('should map unknown errors to BadRequestException', () => {
      const exception = new ApplicationError('UNKNOWN_ERROR');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'UNKNOWN_ERROR',
        error: 'BadRequestException',
      });
    });
  });
});
