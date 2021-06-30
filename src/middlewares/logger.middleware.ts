import { gql } from '@apollo/client/core';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
// eslint-disable-next-line @roq/lodash-destructuring-import-is-not-allowed
import { get } from 'lodash';
import { v4 } from 'uuid';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction): void {
    if (req.headers) {
      if (!req.headers['request-id']) {
        req.headers['request-id'] = v4();
      }
    }
    if (req.body.query && req.body.operationName !== 'IntrospectionQuery') {
      const graphql = req.body.query;
      const type = graphql.includes('mutation') ? 'Mutation' : 'Query';
      const operationName = get(gql(graphql), 'definitions[0].selectionSet.selections[0].name.value', 'unknown');
      this.logger.log({
        message: `${type}: ${operationName}`,
        type: type.toLocaleLowerCase(),
        requestId: req.headers['request-id'],
        caller: req.headers['request-caller'],
        api: {
          type: type.toLocaleLowerCase(),
          graphql,
          headers: req.headers,
          variables: req.body.variables,
        },
      });
    } else if (!req.body.query) {
      this.logger.log({
        message: `HTTPRequest: ${req.method}`,
        type: 'httprequest',
        requestId: req.headers['request-id'],
        caller: req.hostname,
        api: {
          type: 'httprequest',
          headers: req.headers,
          payload: req.body,
          query: req.query,
        },
      });
    }
    next();
  }
}
