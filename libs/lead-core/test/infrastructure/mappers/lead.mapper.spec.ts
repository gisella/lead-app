import {
  LeadMapper,
  DbLead,
  DbLeadRequest,
} from '@app/lead-core/infrastructure/mappers/lead.mapper';
import { Lead } from '@app/lead-core/domain';
import { SimulationMapper } from '@app/lead-core/infrastructure/mappers/simulation.mapper';

describe('LeadMapper', () => {
  const dbLead = {
    id: BigInt(1),
    phone_nr: '+1234567890',
    status: 'ACTIVE' as const,
    created_at: new Date('2024-01-01T00:00:00Z'),
  };

  const dbLeadRequest = {
    amount: BigInt(50000),
    house_worth: BigInt(200000),
    city: 'Roma',
    hash: 'somehash',
    created_at: new Date('2024-01-01T00:00:00Z'),
    owners: [
      {
        id: BigInt(10),
        owner_type: 'FIRST' as const,
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: new Date('1990-01-01'),
        monthly_income: BigInt(5000),
        monthly_payments: 12,
        lead_request_id: BigInt(100),
      },
    ],
  } as DbLeadRequest;

  describe('toEntity', () => {
    it('should map DbLead to Lead entity', () => {
      const lead = LeadMapper.toEntity(dbLead as DbLead);
      expect(lead).toBeInstanceOf(Lead);
      expect(lead.id).toBe(Number(dbLead.id));
      expect(lead.phoneNr).toBe(dbLead.phone_nr);
      expect(lead.lastSimulation).toBeNull();
    });
  });

  describe('toDbEntity', () => {
    it('should map Lead entity to DB object', () => {
      const lead = new Lead({
        id: 1,
        phoneNr: '+1234567890',
        lastSimulation: null,
      });
      const dbEntity = LeadMapper.toDbEntity(lead);
      expect(dbEntity).toEqual({ phone_nr: '+1234567890' });
    });
  });

  describe('toEntityWithSimulation', () => {
    it('should map DbLead and DbLeadRequest to Lead entity with simulation', () => {
      // Mock SimulationMapper.toEntity
      const simulation = { fake: 'simulation' };
      const spy = jest
        .spyOn(SimulationMapper, 'toEntity')
        .mockReturnValue(simulation as any);

      const lead = LeadMapper.toEntityWithSimulation(dbLead, dbLeadRequest);
      expect(lead).toBeInstanceOf(Lead);
      expect(lead.id).toBe(Number(dbLead.id));
      expect(lead.phoneNr).toBe(dbLead.phone_nr);
      expect(lead.lastSimulation).toBe(simulation);
      expect(spy).toHaveBeenCalledWith(dbLeadRequest);
      spy.mockRestore();
    });

    it('should map DbLead to Lead entity with null simulation if dbLeadRequest is not provided', () => {
      const lead = LeadMapper.toEntityWithSimulation(dbLead);
      expect(lead).toBeInstanceOf(Lead);
      expect(lead.id).toBe(Number(dbLead.id));
      expect(lead.phoneNr).toBe(dbLead.phone_nr);
      expect(lead.lastSimulation).toBeNull();
    });
  });
});
