import { Module } from '@nestjs/common';
import {
  CrmRepositoryI,
  LeadDbRepositoryI,
  LeadCoreService,
} from '@app/lead-core/domain';
import { CrmRepository, LeadDbRepository } from '@app/lead-core';
import { HttpModule, HttpService } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService, PrismaModule } from '@db/prisma/src';

@Module({
  imports: [HttpModule, ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
  providers: [
    LeadCoreService,
    {
      provide: CrmRepositoryI,
      useFactory: (httpService: HttpService, configService: ConfigService) => {
        return new CrmRepository(httpService, configService);
      },
      inject: [HttpService, ConfigService],
    },
    {
      provide: LeadDbRepositoryI,
      useFactory: (prismaService: PrismaService) => {
        return new LeadDbRepository(prismaService);
      },
      inject: [PrismaService],
    },
  ],
  exports: [LeadCoreService],
})
export class LeadCoreModule {}
