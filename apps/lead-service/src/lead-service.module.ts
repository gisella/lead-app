import { Module } from '@nestjs/common';
import { LeadCoreModule } from '@app/lead-core';
import {
  LeadExceptionFilter,
  LeadServiceController,
  HealthController,
} from './application';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';
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
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
  controllers: [LeadServiceController, HealthController],
})
export class LeadServiceModule {}
