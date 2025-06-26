import { Module } from '@nestjs/common';
import { DynamicModule } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { IncomingMessage } from 'http';

export interface LoggerModuleOptions {
  appName: string;
  node_env: string;
  log_level?: 'debug' | 'info' | 'warn' | 'error';
}

@Module({})
export class PinoLogModule {
  static forRoot(options: LoggerModuleOptions): DynamicModule {
    const { appName, node_env, log_level = 'debug' } = options;

    const transport =
      node_env === 'production'
        ? {
            target: 'pino-roll',
            options: {
              file: `./logs/${appName}.log`,
              frequency: 'daily',
              mkdir: true,
              size: '10m',
              extension: '.log',
              maxFiles: 7,
            },
          }
        : {
            target: 'pino-pretty',
            options: {
              singleLine: true,
            },
          };

    return {
      module: PinoLogModule,
      imports: [
        PinoLoggerModule.forRoot({
          pinoHttp: {
            level: log_level,
            customProps: () => ({
              context: `[${appName}]`,
            }),
            formatters: {
              level: (label) => ({ level: label }),
            },
            autoLogging: {
              ignore: (req: IncomingMessage) => {
                return (
                  req.url?.startsWith('/health') ||
                  req.url?.startsWith('/docs') ||
                  false
                );
              },
            },
            redact: {
              paths: ['req.headers.authorization', 'req.body.password'],
              censor: '[REDACTED]',
            },
            transport,
          },
        }),
      ],
      exports: [PinoLoggerModule],
    };
  }
}
