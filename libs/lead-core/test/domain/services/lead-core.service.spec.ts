import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LeadCoreService } from '@app/lead-core/domain/services/lead-core.service';
import { Lead, Simulation, Owner } from '@app/lead-core/domain';
import { LeadDbRepositoryI } from '@app/lead-core/domain';
import { CrmRepositoryI } from '@app/lead-core/domain';
import { TooManyRequestException } from '@app/lead-core/domain';
import { TransactionManager } from '@db/prisma/src';
import { DateTime } from 'luxon';

describe('LeadCoreService', () => {
  let service: LeadCoreService;
  let databaseRepository: jest.Mocked<LeadDbRepositoryI>;
  let crmRepository: jest.Mocked<CrmRepositoryI>;
  let transactionManager: jest.Mocked<TransactionManager>;
  let configService: jest.Mocked<ConfigService>;

  const mockLead = new Lead({
    id: 1,
    phoneNr: '+1234567890',
    lastSimulation: null,
  });

  const mockSimulation = new Simulation({
    amount: 100000,
    house_worth: 200000,
    city: 'Test City',
    owners: [
      new Owner({
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 12,
      }),
    ],
    createdAt: DateTime.now(),
  });

  beforeEach(async () => {
    const mockDatabaseRepository = {
      findLeadBy: jest.fn(),
      insertLead: jest.fn(),
      addSimulation: jest.fn(),
    };

    const mockCrmRepository = {
      syncLead: jest.fn(),
    };

    const mockTransactionManager = {
      executeTransaction: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn().mockReturnValue(10),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadCoreService,
        {
          provide: LeadDbRepositoryI,
          useValue: mockDatabaseRepository,
        },
        {
          provide: CrmRepositoryI,
          useValue: mockCrmRepository,
        },
        {
          provide: TransactionManager,
          useValue: mockTransactionManager,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<LeadCoreService>(LeadCoreService);
    databaseRepository = module.get(LeadDbRepositoryI);
    crmRepository = module.get(CrmRepositoryI);
    transactionManager = module.get(TransactionManager);
    configService = module.get(ConfigService);

    // Default config value
    //configService.get.mockReturnValue(10);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('newLead', () => {
    describe('when lead does not exist', () => {
      it('should create new lead, sync with CRM, and add simulation', async () => {
        // Arrange
        const phoneNr = '+1234567890';
        databaseRepository.findLeadBy.mockResolvedValue(null);
        databaseRepository.insertLead.mockResolvedValue(mockLead);
        crmRepository.syncLead.mockResolvedValue();
        transactionManager.executeTransaction.mockImplementation(
          async (callback) => {
            return await callback({} as any);
          },
        );
        databaseRepository.addSimulation.mockResolvedValue(mockSimulation);

        // Act
        const result = await service.newLead(phoneNr, mockSimulation);

        // Assert
        expect(databaseRepository.findLeadBy).toHaveBeenCalledWith({ phoneNr });
        expect(databaseRepository.insertLead).toHaveBeenCalledWith(
          expect.objectContaining({ phoneNr }),
        );
        expect(crmRepository.syncLead).toHaveBeenCalledWith(mockLead);
        expect(transactionManager.executeTransaction).toHaveBeenCalled();
        expect(databaseRepository.addSimulation).toHaveBeenCalledWith(
          mockLead.id,
          mockSimulation,
          expect.any(Object),
        );
        expect(result).toEqual(
          expect.objectContaining({ lastSimulation: mockSimulation }),
        );
      });
    });

    describe('when lead exists', () => {
      it('should not create new lead or sync with CRM', async () => {
        // Arrange
        const phoneNr = '+1234567890';
        const existingLead = new Lead({
          id: 1,
          phoneNr,
          lastSimulation: null,
        });
        databaseRepository.findLeadBy.mockResolvedValue(existingLead);
        transactionManager.executeTransaction.mockImplementation(
          async (callback) => {
            return await callback({} as any);
          },
        );
        databaseRepository.addSimulation.mockResolvedValue(mockSimulation);

        // Act
        const result = await service.newLead(phoneNr, mockSimulation);

        // Assert
        expect(databaseRepository.findLeadBy).toHaveBeenCalledWith({ phoneNr });
        expect(databaseRepository.insertLead).not.toHaveBeenCalled();
        expect(crmRepository.syncLead).not.toHaveBeenCalled();
        expect(transactionManager.executeTransaction).toHaveBeenCalled();
        expect(result).toEqual(
          expect.objectContaining({ lastSimulation: mockSimulation }),
        );
      });
    });

    describe('when simulation is allowed', () => {
      it('should add simulation when no previous simulation exists', async () => {
        // Arrange
        const phoneNr = '+1234567890';
        const leadWithoutSimulation = new Lead({
          id: 1,
          phoneNr,
          lastSimulation: null,
        });
        databaseRepository.findLeadBy.mockResolvedValue(leadWithoutSimulation);
        transactionManager.executeTransaction.mockImplementation(
          async (callback) => {
            return await callback({} as any);
          },
        );
        databaseRepository.addSimulation.mockResolvedValue(mockSimulation);

        // Act
        await service.newLead(phoneNr, mockSimulation);

        // Assert
        expect(transactionManager.executeTransaction).toHaveBeenCalled();
        expect(databaseRepository.addSimulation).toHaveBeenCalledWith(
          leadWithoutSimulation.id,
          mockSimulation,
          expect.any(Object),
        );
      });

      it('should add simulation when hash is different', async () => {
        // Arrange
        const phoneNr = '+1234567890';
        const oldSimulation = new Simulation({
          ...mockSimulation,
          hash: 'different-hash',
        });
        const leadWithOldSimulation = new Lead({
          id: 1,
          phoneNr,
          lastSimulation: oldSimulation,
        });
        databaseRepository.findLeadBy.mockResolvedValue(leadWithOldSimulation);
        transactionManager.executeTransaction.mockImplementation(
          async (callback) => {
            return await callback({} as any);
          },
        );
        databaseRepository.addSimulation.mockResolvedValue(mockSimulation);

        // Act
        await service.newLead(phoneNr, mockSimulation);

        // Assert
        expect(transactionManager.executeTransaction).toHaveBeenCalled();
        expect(databaseRepository.addSimulation).toHaveBeenCalledWith(
          leadWithOldSimulation.id,
          mockSimulation,
          expect.any(Object),
        );
      });

      it('should add simulation when enough time has passed', async () => {
        // Arrange
        const phoneNr = '+1234567890';
        const oldSimulation = new Simulation({
          ...mockSimulation,
          createdAt: DateTime.now().minus({ minutes: 15 }), // 15 minutes ago
        });
        const leadWithOldSimulation = new Lead({
          id: 1,
          phoneNr,
          lastSimulation: oldSimulation,
        });
        databaseRepository.findLeadBy.mockResolvedValue(leadWithOldSimulation);
        transactionManager.executeTransaction.mockImplementation(
          async (callback) => {
            return await callback({} as any);
          },
        );
        databaseRepository.addSimulation.mockResolvedValue(mockSimulation);

        // Act
        await service.newLead(phoneNr, mockSimulation);

        // Assert
        expect(transactionManager.executeTransaction).toHaveBeenCalled();
        expect(databaseRepository.addSimulation).toHaveBeenCalledWith(
          leadWithOldSimulation.id,
          mockSimulation,
          expect.any(Object),
        );
      });
    });

    describe('when simulation is not allowed', () => {
      it('should throw TooManyRequestException when same hash and recent simulation', async () => {
        // Arrange
        const phoneNr = '+1234567890';
        const recentSimulation = new Simulation({
          ...mockSimulation,
          createdAt: DateTime.now().minus({ minutes: 5 }), // 5 minutes ago
        });
        const leadWithRecentSimulation = new Lead({
          id: 1,
          phoneNr,
          lastSimulation: recentSimulation,
        });
        databaseRepository.findLeadBy.mockResolvedValue(
          leadWithRecentSimulation,
        );

        // Act & Assert
        expect(
          async () => await service.newLead(phoneNr, mockSimulation),
        ).rejects.toThrow(TooManyRequestException);
        expect(transactionManager.executeTransaction).not.toHaveBeenCalled();
        expect(databaseRepository.addSimulation).not.toHaveBeenCalled();
      });
    });
  });

  describe('error handling', () => {
    it('should propagate database errors', async () => {
      // Arrange
      const phoneNr = '+1234567890';
      const dbError = new Error('Database connection failed');
      databaseRepository.findLeadBy.mockRejectedValue(dbError);

      // Act & Assert
      await expect(service.newLead(phoneNr, mockSimulation)).rejects.toThrow(
        dbError,
      );
    });

    it('should propagate CRM sync errors', async () => {
      // Arrange
      const phoneNr = '+1234567890';
      databaseRepository.findLeadBy.mockResolvedValue(null);
      databaseRepository.insertLead.mockResolvedValue(mockLead);
      const crmError = new Error('CRM service unavailable');
      crmRepository.syncLead.mockRejectedValue(crmError);

      // Act & Assert
      await expect(service.newLead(phoneNr, mockSimulation)).rejects.toThrow(
        crmError,
      );
    });

    it('should propagate transaction errors', async () => {
      // Arrange
      const phoneNr = '+1234567890';
      databaseRepository.findLeadBy.mockResolvedValue(mockLead);
      const transactionError = new Error('Transaction failed');
      transactionManager.executeTransaction.mockRejectedValue(transactionError);

      // Act & Assert
      expect(
        async () => await service.newLead(phoneNr, mockSimulation),
      ).rejects.toThrow(transactionError);
    });
  });
});
