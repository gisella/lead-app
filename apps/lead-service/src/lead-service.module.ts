import { Module } from '@nestjs/common';
import { LeadCoreModule } from '@app/lead-core';
import {
  LeadExceptionFilter,
  LeadServiceController,
  HealthController,
} from './application';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PinoLogModule } from '@logger/src';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PinoLogModule.forRoot({
      appName: process.env.APP_NAME || 'lead-service',
      node_env: process.env.NODE_ENV || 'development',
    }),
    LeadCoreModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: LeadExceptionFilter,
    },
  ],
  controllers: [LeadServiceController, HealthController],
})
export class LeadServiceModule {}
