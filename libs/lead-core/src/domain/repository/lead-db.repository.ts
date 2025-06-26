import { Lead, Simulation } from '@app/lead-core/domain';
import { Prisma } from '@db/prisma/src/database/client/lead';

export interface LeadSearchParams {
  phoneNr: string;
}

export abstract class LeadDbRepositoryI {
  abstract insertLead(lead: Lead): Promise<Lead>;

  abstract addSimulation(
    leadId: number,
    simulation: Simulation,
    trx?: Prisma.TransactionClient,
  ): Promise<Simulation>;

  abstract findLeadBy(searchParams: LeadSearchParams): Promise<Lead | null>;
}
