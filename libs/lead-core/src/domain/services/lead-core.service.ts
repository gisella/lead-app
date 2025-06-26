import { Injectable, Logger } from '@nestjs/common';
import { Lead } from '../models/Lead';
import { LeadDbRepositoryI } from '@app/lead-core/domain';
import { CrmRepositoryI } from '@app/lead-core/domain';
import { Simulation } from '../models/Simulation';
import { TooManyRequestException } from '@app/lead-core/domain';
import { TransactionManager } from '@db/prisma/src';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LeadCoreService {
  private readonly logger = new Logger('LeadCoreService');
  private readonly MINUTES_AMONG_SIMULATION: number;

  constructor(
    private readonly databaseRepository: LeadDbRepositoryI,
    private readonly crmRepository: CrmRepositoryI,
    private readonly transactionManager: TransactionManager,
    configService: ConfigService,
  ) {
    this.MINUTES_AMONG_SIMULATION = configService.get<number>(
      'MINUTES_AMONG_SIMULATION',
      10,
    );
  }

  async newLead(phoneNr: string, simulation: Simulation): Promise<Lead> {
    let lead = await this.databaseRepository.findLeadBy({ phoneNr });
    if (!lead) {
      lead = await this.databaseRepository.insertLead(
        new Lead({ phoneNr: phoneNr }),
      );
      await this.crmRepository.syncLead(lead);
    }

    if (this.canSubmitNewSimulation(lead, simulation.toHash())) {
      await this.transactionManager.executeTransaction(async (trx) => {
        lead.lastSimulation = await this.databaseRepository.addSimulation(
          lead.id,
          simulation,
          trx,
        );
      });
    } else {
      throw new TooManyRequestException();
    }

    return lead;
  }

  private canSubmitNewSimulation(lead: Lead, newHash: string): boolean {
    return (
      lead.lastSimulation === null ||
      lead.lastSimulation.hash !== newHash ||
      Math.abs(Math.floor(lead.lastSimulation.getMinutesFromNow())) >
        this.MINUTES_AMONG_SIMULATION
    );
  }
}
