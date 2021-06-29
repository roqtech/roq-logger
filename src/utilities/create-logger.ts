import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// eslint-disable-next-line @roq/lodash-destructuring-import-is-not-allowed
import { cloneDeep, isObject } from 'lodash';
import { WinstonModule } from 'nest-winston';
import { GoogleCloudTransport } from 'src/transports';
import * as winston from 'winston';

export function createLogger(configService: ConfigService, skipKeys: string[] = []): LoggerService {
  const filterApiVariables = (log: any) => {
    if (isObject(log)) {
      Object.keys(log).forEach((key) => {
        if (skipKeys.find((k) => k === key)) {
          delete log[key];
        } else {
          filterApiVariables(log[key]);
        }
      });
    }
  };
  const formats = [
    winston.format((info) => {
      info.timestamp = new Date().getTime();
      info.service = configService.get('application.appName');
      info.environment = configService.get('application.appEnvironment');
      if (info?.api?.variables) {
        const variables = cloneDeep(info.api.variables);
        filterApiVariables(variables);
        info.api.variables = JSON.stringify(variables);
      }
      if (info.context === 'ExceptionsHandler') {
        return null;
      }
      return info;
    })(),
  ];
  const format = winston.format.combine(...formats);
  const transports = [];
  if (configService.get('application.consoleLogs')) {
    if (configService.get('application.cloudLogs')) {
      transports.push(new GoogleCloudTransport({}, configService.get('application.cloudLogsName')));
    } else {
      transports.push(
        new winston.transports.Console({
          format: winston.format.json(),
        }),
      );
    }
  }
  if (configService.get('application.fileLogs')) {
    transports.push(
      new winston.transports.File({
        filename: 'combined.log',
      }),
    );
  }
  return WinstonModule.createLogger({
    format,
    transports,
  });
}
