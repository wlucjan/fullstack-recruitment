import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApplicationError } from './application.error';

@Catch(ApplicationError)
export class ApplicationErrorFilter implements ExceptionFilter {
  catch(exception: ApplicationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const httpException = this.mapToHttpException(exception);
    const status = httpException.getStatus();
    const message = httpException.message;

    response.status(status).json({
      statusCode: status,
      message,
      error: httpException.name,
    });
  }

  private mapToHttpException(exception: ApplicationError) {
    const message = exception.message;

    // Map based on high-level error categories from user.error.ts
    if (message.includes('CONFLICT')) {
      return new ConflictException('Conflict occurred');
    }

    if (message.includes('BAD_REQUEST')) {
      return new BadRequestException('Bad request');
    }

    if (message.includes('NOT_FOUND')) {
      return new NotFoundException('Resource not found');
    }

    // Default case for unknown application errors
    return new BadRequestException(message);
  }
}
