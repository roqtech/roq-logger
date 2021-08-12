import { ArgumentsHost, Catch, HttpServer, Logger } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class LoggerExceptionFilter extends BaseExceptionFilter {
  constructor(private logger: Logger, applicationRef?: HttpServer) {
    super(applicationRef);
  }
  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof Error) {
      const gqlHost = GqlArgumentsHost.create(host);
      const gqlContext = gqlHost.getContext();
      const gqlReq = gqlContext.req;
      if (gqlReq) {
        this.logger.error(
          {
            message: `Error: ${exception.message}`,
            type: 'error',
            stack: exception.stack,
            requestId: gqlReq.headers['request-id'],
          },
          exception.stack,
        );
      } else {
        const httpContext = host.switchToHttp();
        const httpReq = httpContext.getRequest();
        if (httpReq) {
          this.logger.error(
            {
              message: `Error: ${exception.message}`,
              type: 'error',
              stack: exception.stack,
              requestId: httpReq.headers['request-id'],
            },
            exception.stack,
          );
        } else {
          this.logger.error(
            {
              message: `Error: ${exception.message}`,
              type: 'error',
              stack: exception.stack,
            },
            exception.stack,
          );
        }

        super.catch(exception, host);
      }
    }
  }
}
