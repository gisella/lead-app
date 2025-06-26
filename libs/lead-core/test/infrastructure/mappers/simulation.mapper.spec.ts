import { SimulationMapper } from '@app/lead-core/infrastructure/mappers/simulation.mapper';
import { Simulation } from '@app/lead-core/domain';
import { OwnerMapper } from '@app/lead-core/infrastructure/mappers/owner.mapper';
import { DateTime } from 'luxon';

describe('SimulationMapper', () => {
  const dbLeadRequest = {
    amount: BigInt(50000),
    house_worth: BigInt(200000),
    city: 'Roma',
    hash: 'somehash',
    created_at: new Date('2024-01-01T00:00:00Z'),
    owners: [
      {
        id: BigInt(10),
        owner_type: 'FIRST' as 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: new Date('1990-01-01'),
        monthly_income: BigInt(5000),
        monthly_payments: 12,
        lead_request_id: BigInt(100),
      },
    ],
  };

  describe('toEntity', () => {
    it('should map DbLeadRequest to Simulation entity with owners', () => {
      const fakeOwner = { fake: 'owner' };
      const spy = jest
        .spyOn(OwnerMapper, 'ownerToEntity')
        .mockReturnValue(fakeOwner as any);

      const simulation = SimulationMapper.toEntity(dbLeadRequest as any);
      expect(simulation).toBeInstanceOf(Simulation);
      expect(simulation.amount).toBe(50000);
      expect(simulation.house_worth).toBe(200000);
      expect(simulation.city).toBe('Roma');
      expect(simulation.hash).toBe('somehash');
      expect(DateTime.isDateTime(simulation.createdAt)).toBe(true);
      expect(simulation.createdAt.toISO()).toBe(
        DateTime.fromJSDate(dbLeadRequest.created_at).toISO(),
      );
      expect(simulation.owners).toHaveLength(1);
      expect(simulation.owners[0]).toBe(fakeOwner);
      expect(spy).toHaveBeenCalledWith(dbLeadRequest.owners[0]);
      spy.mockRestore();
    });

    it('should map DbLeadRequest to Simulation entity with empty owners if not provided', () => {
      const dbLeadRequestNoOwners = { ...dbLeadRequest, owners: undefined };
      const simulation = SimulationMapper.toEntity(
        dbLeadRequestNoOwners as any,
      );
      expect(simulation.owners).toEqual([]);
    });
  });

  describe('toDbEntity', () => {
    it('should map Simulation entity to db object', () => {
      const simulation = new Simulation({
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        hash: 'somehash',
        createdAt: DateTime.fromISO('2024-01-01T00:00:00Z'),
        owners: [],
      });
      simulation.toHash = jest.fn(() => 'somehash');
      const dbEntity = SimulationMapper.toDbEntity(simulation, 42);
      expect(dbEntity).toEqual({
        lead_id: 42,
        amount: BigInt(50000),
        house_worth: BigInt(200000),
        city: 'Roma',
        hash: 'somehash',
      });
      expect(simulation.toHash).toHaveBeenCalled();
    });
  });
});
