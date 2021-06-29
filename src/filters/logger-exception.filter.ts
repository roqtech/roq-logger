import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';

@Catch()
export class LoggerExceptionFilter implements GqlExceptionFilter {
  constructor(private logger: Logger) {}
  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof Error) {
      const gqlHost = GqlArgumentsHost.create(host);
      const gqlContext = gqlHost.getContext();
      const req = gqlContext.req;
      if (req) {
        this.logger.error(
          {
            message: `Error: ${exception.message}`,
            type: 'error',
            stack: exception.stack,
            requestId: req.headers['request-id'],
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
    }
  }
}
