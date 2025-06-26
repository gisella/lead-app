import { Module } from '@nestjs/common';
import { LeadCoreModule } from '@app/lead-core';
import {
  LeadServiceController,
} from './application';
import { ConfigModule } from '@nestjs/config';
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

  ],
  controllers: [LeadServiceController],
})
export class LeadServiceModule {}
