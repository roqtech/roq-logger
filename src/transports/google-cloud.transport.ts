import { Log, Logging } from '@google-cloud/logging';
import * as Transport from 'winston-transport';

export class GoogleCloudTransport extends Transport {
  private logging: Logging;
  private logger: Log;
  constructor(opts: Transport.TransportStreamOptions, name: string) {
    super(opts);
    this.logging = new Logging();
    this.logger = this.logging.log(name);
  }
  log(info: any, callback: () => void): void {
    let severity = 'INFO';
    if (info.level === 'error') {
      severity = 'ERROR';
    }
    const entry = this.logger.entry({ severity }, info);
    void this.logger.write(entry);
    callback();
  }
}
