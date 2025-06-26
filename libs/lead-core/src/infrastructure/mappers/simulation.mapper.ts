import { Simulation } from '@app/lead-core/domain';
import { OwnerMapper } from '@app/lead-core/infrastructure/mappers/owner.mapper';
import { DateTime } from 'luxon';

type OwnerType = 'FIRST' | 'SECOND';

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

export class SimulationMapper {
  static toEntity(dbLeadRequest: DbLeadRequest): Simulation {
    return new Simulation({
      amount: Number(dbLeadRequest.amount),
      house_worth: Number(dbLeadRequest.house_worth),
      city: dbLeadRequest.city,
      hash: dbLeadRequest.hash,
      createdAt: DateTime.fromJSDate(dbLeadRequest.created_at),
      owners:
        dbLeadRequest.owners?.map((owner) =>
          OwnerMapper.ownerToEntity(owner),
        ) || [],
    });
  }

  static toDbEntity(simulation: Simulation, leadId: number): any {
    return {
      lead_id: leadId,
      amount: BigInt(simulation.amount),
      house_worth: BigInt(simulation.house_worth),
      city: simulation.city,
      hash: simulation.toHash(),
    };
  }
}
