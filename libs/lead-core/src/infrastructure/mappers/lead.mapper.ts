import { Lead } from '@app/lead-core/domain';
import { SimulationMapper } from '@app/lead-core/infrastructure/mappers/simulation.mapper';

type OwnerType = 'FIRST' | 'SECOND';
type LeadStatus = 'ACTIVE' | 'INACTIVE';

interface DbLead {
  id: bigint;
  phone_nr: string;
  status: LeadStatus | null;
  created_at: Date;
}

interface DbLeadRequest {
  amount: bigint;
  house_worth: bigint;
  city: string;
  hash: string;
  created_at: Date;
  owners?: Array<{
    id: bigint;
    owner_type: OwnerType | null;
    first_name: string;
    last_name: string;
    email: string | null;
    birth_date: Date;
    monthly_income: bigint;
    monthly_payments: number | null;
    lead_request_id: bigint;
  }>;
}

export class LeadMapper {
  static toEntity(dbLead: DbLead): Lead {
    return new Lead({
      id: Number(dbLead.id),
      phoneNr: dbLead.phone_nr,
      lastSimulation: null, // Will be set separately if needed
    });
  }

  static toDbEntity(lead: Lead): { phone_nr: string } {
    return {
      phone_nr: lead.phoneNr,
    };
  }

  static toEntityWithSimulation(
    dbLead: DbLead,
    dbLeadRequest?: DbLeadRequest,
  ): Lead {
    const lead = this.toEntity(dbLead);

    if (dbLeadRequest) {
      lead.lastSimulation = SimulationMapper.toEntity(dbLeadRequest);
    }

    return lead;
  }
}
