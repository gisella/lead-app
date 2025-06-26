import { LeadDbRepository } from '@app/lead-core/infrastructure/repository/lead-db.repository';
import { Lead } from '@app/lead-core/domain';
import { SimulationMapper } from '@app/lead-core/infrastructure/mappers/simulation.mapper';
import { OwnerMapper } from '@app/lead-core/infrastructure/mappers/owner.mapper';
import { LeadMapper } from '@app/lead-core/infrastructure/mappers/lead.mapper';

describe('LeadDbRepository', () => {
  let repo: LeadDbRepository;
  let prismaService: any;

  beforeEach(() => {
    prismaService = {
      leads: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
      lead_requests: {
        create: jest.fn(),
      },
      owners: {
        createMany: jest.fn(),
      },
    };
    repo = new LeadDbRepository(prismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('insertLead', () => {
    it('should insert a lead and return the mapped entity', async () => {
      const lead = {
        id: 1,
        phoneNr: '+1234567890',
        lastSimulation: null,
      } as Lead;
      const dbLead = { id: 1, phone_nr: '+1234567890' };
      prismaService.leads.create.mockResolvedValue(dbLead);
      jest
        .spyOn(LeadMapper, 'toDbEntity')
        .mockReturnValue({ phone_nr: '+1234567890' });
      jest.spyOn(LeadMapper, 'toEntity').mockReturnValue(lead);

      const result = await repo.insertLead(lead);
      expect(prismaService.leads.create).toHaveBeenCalledWith({
        data: { phone_nr: '+1234567890' },
      });
      expect(result).toBe(lead);
    });

    it('should throw error if insert fails', async () => {
      const lead = {
        id: 1,
        phoneNr: '+1234567890',
        lastSimulation: null,
      } as Lead;
      const error = new Error('Insert failed');
      prismaService.leads.create.mockRejectedValue(error);
      jest
        .spyOn(LeadMapper, 'toDbEntity')
        .mockReturnValue({ phone_nr: '+1234567890' });

      await expect(repo.insertLead(lead)).rejects.toThrow('Insert failed');
    });
  });

  describe('addSimulation', () => {
    it('should add a simulation and return the mapped entity', async () => {
      const simulation = {
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        toHash: () => 'hash',
        owners: [],
      } as any;
      const createdSimulation = { id: 42 };
      prismaService.lead_requests.create.mockResolvedValue(createdSimulation);
      jest
        .spyOn(OwnerMapper, 'ownersToDbEntities')
        .mockReturnValue([{ owner: 'data' }]);
      prismaService.owners.createMany.mockResolvedValue({});
      jest.spyOn(SimulationMapper, 'toEntity').mockReturnValue(simulation);

      const result = await repo.addSimulation(1, simulation);
      expect(prismaService.lead_requests.create).toHaveBeenCalledWith({
        data: {
          lead_id: 1,
          amount: BigInt(simulation.amount),
          house_worth: BigInt(simulation.house_worth),
          city: simulation.city,
          hash: simulation.toHash(),
        },
      });
      expect(prismaService.owners.createMany).toHaveBeenCalledWith({
        data: [{ owner: 'data' }],
      });
      expect(result).toBe(simulation);
    });

    it('should use transaction client if provided', async () => {
      const simulation = {
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        toHash: () => 'hash',
        owners: [],
      } as any;
      const createdSimulation = { id: 42 };
      const trx = {
        lead_requests: {
          create: jest.fn().mockResolvedValue(createdSimulation),
        },
        owners: { createMany: jest.fn().mockResolvedValue({}) },
      } as any;
      jest
        .spyOn(OwnerMapper, 'ownersToDbEntities')
        .mockReturnValue([{ owner: 'data' }]);
      jest.spyOn(SimulationMapper, 'toEntity').mockReturnValue(simulation);

      const result = await repo.addSimulation(1, simulation, trx);
      expect(trx.lead_requests.create).toHaveBeenCalled();
      expect(trx.owners.createMany).toHaveBeenCalled();
      expect(result).toBe(simulation);
    });

      it('should throw error if addSimulation fails', async () => {
        const simulation = {
          amount: 50000,
          house_worth: 200000,
          city: 'Roma',
          toHash: () => 'hash',
          owners: [],
        } as any;
        prismaService.lead_requests.create.mockRejectedValue(
          new Error('Sim failed'),
        );
        await expect(repo.addSimulation(1, simulation)).rejects.toThrow(
          'Sim failed',
        );

      });
    });

  describe('findLeadBy', () => {
    it('should return null if no lead is found', async () => {
      prismaService.leads.findUnique.mockResolvedValue(null);
      const result = await repo.findLeadBy({ phoneNr: '+1234567890' });
      expect(result).toBeNull();
    });

    it('should return mapped lead with simulation if found', async () => {
      const dbLead = {
        id: 1,
        phone_nr: '+1234567890',
        lead_requests: [{ id: 2 }],
      };
      const mappedLead = {
        id: 1,
        phoneNr: '+1234567890',
        lastSimulation: {},
      } as Lead;
      prismaService.leads.findUnique.mockResolvedValue(dbLead);
      jest
        .spyOn(LeadMapper, 'toEntityWithSimulation')
        .mockReturnValue(mappedLead);

      const result = await repo.findLeadBy({ phoneNr: '+1234567890' });
      expect(result).toBe(mappedLead);
      expect(LeadMapper.toEntityWithSimulation).toHaveBeenCalledWith(
        dbLead,
        dbLead.lead_requests[0],
      );
    });

    it('should return mapped lead without simulation if lead_requests is empty', async () => {
      const dbLead = {
        id: 1,
        phone_nr: '+1234567890',
        lead_requests: [],
      };
      const mappedLead = {
        id: 1,
        phoneNr: '+1234567890',
        lastSimulation: null,
      } as Lead;
      prismaService.leads.findUnique.mockResolvedValue(dbLead);
      jest
        .spyOn(LeadMapper, 'toEntityWithSimulation')
        .mockReturnValue(mappedLead);

      const result = await repo.findLeadBy({ phoneNr: '+1234567890' });
      expect(result).toBe(mappedLead);
      expect(LeadMapper.toEntityWithSimulation).toHaveBeenCalledWith(
        dbLead,
        undefined,
      );
    });
  });
});
