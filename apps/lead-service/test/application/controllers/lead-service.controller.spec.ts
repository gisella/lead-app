import { Test, TestingModule } from '@nestjs/testing';
import { LeadServiceController } from '../../../src/application';
import {
  Lead,
  LeadCoreService,
  Owner,
  Simulation,
} from '@app/lead-core/domain';
import {
  NewLeadRequestDto,
  OwnerDto,
} from '../../../src/application/dto/new-lead-request.dto';

describe('LeadServiceController', () => {
  let controller: LeadServiceController;
  let leadCoreService: jest.Mocked<LeadCoreService>;
  const mockOwner = new Owner({
    type: 'FIRST',
    first_name: 'Bianchi',
    last_name: 'Mario',
    email: 'mbianchi@example.com',
    birth_date: '01-01-1990',
    monthly_income: 5000,
    monthly_payments: 12,
  });

  const mockSimulation = new Simulation({
    amount: 50000,
    house_worth: 200000,
    city: 'Roma',
    owners: [mockOwner],
  });

  const mockLead = new Lead({
    id: 1,
    phoneNr: '+1234567890',
    lastSimulation: mockSimulation,
  });

  beforeEach(async () => {
    const mockLeadCoreService = {
      newLead: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadServiceController],
      providers: [
        {
          provide: LeadCoreService,
          useValue: mockLeadCoreService,
        },
      ],
    }).compile();

    controller = module.get<LeadServiceController>(LeadServiceController);
    leadCoreService = module.get(LeadCoreService);

    // Setup default mock implementations
    leadCoreService.newLead.mockResolvedValue(mockLead);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('newLead', () => {
    it('should create a new lead successfully', async () => {
      // Arrange
      const mockOwnerDto: OwnerDto = {
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 12,
        toOwner: jest.fn().mockReturnValue(mockOwner),
      };

      const mockNewLeadRequestDto: NewLeadRequestDto = {
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        phone_nr: '+1234567890',
        owners: [mockOwnerDto],
        asSimulation: jest.fn().mockReturnValue(mockSimulation),
      };

      // Act
      const result = await controller.newLead(mockNewLeadRequestDto);

      // Assert
      expect(mockNewLeadRequestDto.asSimulation).toHaveBeenCalled();
      expect(leadCoreService.newLead).toHaveBeenCalledWith(
        mockNewLeadRequestDto.phone_nr,
        mockSimulation,
      );
      expect(result).toBe(mockLead);
    });

    it('should handle different phone numbers correctly', async () => {
      // Arrange
      const differentPhoneNumber = '+9876543210';
      const mockOwnerDto: OwnerDto = {
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 12,
        toOwner: jest.fn().mockReturnValue(mockOwner),
      };

      const requestWithDifferentPhone: NewLeadRequestDto = {
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        phone_nr: differentPhoneNumber,
        owners: [mockOwnerDto],
        asSimulation: jest.fn().mockReturnValue(mockSimulation),
      };
      const expectedLogMessage = `Creating new lead for phone number: ${differentPhoneNumber}`;

      // Act
      await controller.newLead(requestWithDifferentPhone);

      // Assert
      expect(leadCoreService.newLead).toHaveBeenCalledWith(
        differentPhoneNumber,
        mockSimulation,
      );
    });

    it('should handle different loan amounts correctly', async () => {
      // Arrange
      const differentAmount = 100000;
      const mockOwnerDto: OwnerDto = {
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 12,
        toOwner: jest.fn().mockReturnValue(mockOwner),
      };

      const differentSimulation = new Simulation({
        amount: differentAmount,
        house_worth: 200000,
        city: 'Roma',
        owners: [mockOwner],
      });

      const requestWithDifferentAmount: NewLeadRequestDto = {
        amount: differentAmount,
        house_worth: 200000,
        city: 'Roma',
        phone_nr: '+1234567890',
        owners: [mockOwnerDto],
        asSimulation: jest.fn().mockReturnValue(differentSimulation),
      };

      // Act
      await controller.newLead(requestWithDifferentAmount);

      // Assert
      expect(leadCoreService.newLead).toHaveBeenCalledWith(
        '+1234567890',
        differentSimulation,
      );
    });

    it('should handle different cities correctly', async () => {
      // Arrange
      const differentCity = 'Los Angeles';
      const mockOwnerDto: OwnerDto = {
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 12,
        toOwner: jest.fn().mockReturnValue(mockOwner),
      };

      const differentSimulation = new Simulation({
        amount: 50000,
        house_worth: 200000,
        city: differentCity,
        owners: [mockOwner],
      });

      const requestWithDifferentCity: NewLeadRequestDto = {
        amount: 50000,
        house_worth: 200000,
        city: differentCity,
        phone_nr: '+1234567890',
        owners: [mockOwnerDto],
        asSimulation: jest.fn().mockReturnValue(differentSimulation),
      };

      // Act
      await controller.newLead(requestWithDifferentCity);

      // Assert
      expect(leadCoreService.newLead).toHaveBeenCalledWith(
        '+1234567890',
        differentSimulation,
      );
    });

    it('should handle different house worth values correctly', async () => {
      // Arrange
      const differentHouseWorth = 300000;
      const mockOwnerDto: OwnerDto = {
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 12,
        toOwner: jest.fn().mockReturnValue(mockOwner),
      };

      const differentSimulation = new Simulation({
        amount: 50000,
        house_worth: differentHouseWorth,
        city: 'Roma',
        owners: [mockOwner],
      });

      const requestWithDifferentHouseWorth: NewLeadRequestDto = {
        amount: 50000,
        house_worth: differentHouseWorth,
        city: 'Roma',
        phone_nr: '+1234567890',
        owners: [mockOwnerDto],
        asSimulation: jest.fn().mockReturnValue(differentSimulation),
      };

      // Act
      await controller.newLead(requestWithDifferentHouseWorth);

      // Assert
      expect(leadCoreService.newLead).toHaveBeenCalledWith(
        '+1234567890',
        differentSimulation,
      );
    });

    it('should handle multiple owners correctly', async () => {
      // Arrange
      const secondOwner = new Owner({
        type: 'SECOND',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        birth_date: '1985-05-15',
        monthly_income: 4000,
        monthly_payments: 13,
      });

      const mockOwnerDto: OwnerDto = {
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 12,
        toOwner: jest.fn().mockReturnValue(mockOwner),
      };

      const secondOwnerDto: OwnerDto = {
        type: 'SECOND',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        birth_date: '1985-05-15',
        monthly_income: 4000,
        monthly_payments: 13,
        toOwner: jest.fn().mockReturnValue(secondOwner),
      };

      const simulationWithMultipleOwners = new Simulation({
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        owners: [mockOwner, secondOwner],
      });

      const requestWithMultipleOwners: NewLeadRequestDto = {
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        phone_nr: '+1234567890',
        owners: [mockOwnerDto, secondOwnerDto],
        asSimulation: jest.fn().mockReturnValue(simulationWithMultipleOwners),
      };

      // Act
      await controller.newLead(requestWithMultipleOwners);

      // Assert
      expect(leadCoreService.newLead).toHaveBeenCalledWith(
        '+1234567890',
        simulationWithMultipleOwners,
      );
    });

    it('should handle empty email in owner correctly', async () => {
      // Arrange
      const ownerWithoutEmailDomain = new Owner({
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: undefined,
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 12,
      });

      const ownerWithoutEmail: OwnerDto = {
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: undefined,
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 12,
        toOwner: jest.fn().mockReturnValue(ownerWithoutEmailDomain),
      };

      const simulationWithOwnerWithoutEmail = new Simulation({
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        owners: [ownerWithoutEmailDomain],
      });

      const requestWithOwnerWithoutEmail: NewLeadRequestDto = {
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        phone_nr: '+1234567890',
        owners: [ownerWithoutEmail],
        asSimulation: jest
          .fn()
          .mockReturnValue(simulationWithOwnerWithoutEmail),
      };

      // Act
      await controller.newLead(requestWithOwnerWithoutEmail);

      // Assert
      expect(leadCoreService.newLead).toHaveBeenCalledWith(
        '+1234567890',
        simulationWithOwnerWithoutEmail,
      );
    });

    it('should handle different monthly payments correctly', async () => {
      // Arrange
      const ownerWithDifferentPaymentsDomain = new Owner({
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 14,
      });

      const ownerWithDifferentPayments: OwnerDto = {
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 14,
        toOwner: jest.fn().mockReturnValue(ownerWithDifferentPaymentsDomain),
      };

      const simulationWithDifferentPayments = new Simulation({
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        owners: [ownerWithDifferentPaymentsDomain],
      });

      const requestWithDifferentPayments: NewLeadRequestDto = {
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        phone_nr: '+1234567890',
        owners: [ownerWithDifferentPayments],
        asSimulation: jest
          .fn()
          .mockReturnValue(simulationWithDifferentPayments),
      };

      // Act
      await controller.newLead(requestWithDifferentPayments);

      // Assert
      expect(leadCoreService.newLead).toHaveBeenCalledWith(
        '+1234567890',
        simulationWithDifferentPayments,
      );
    });

    it('should handle LeadCoreService throwing an error', async () => {
      // Arrange
      const error = new Error('Service error');
      leadCoreService.newLead.mockRejectedValue(error);

      const mockOwnerDto: OwnerDto = {
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 12,
        toOwner: jest.fn().mockReturnValue(mockOwner),
      };

      const mockNewLeadRequestDto: NewLeadRequestDto = {
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        phone_nr: '+1234567890',
        owners: [mockOwnerDto],
        asSimulation: jest.fn().mockReturnValue(mockSimulation),
      };

      // Act & Assert
      await expect(controller.newLead(mockNewLeadRequestDto)).rejects.toThrow(
        'Service error',
      );

      expect(mockNewLeadRequestDto.asSimulation).toHaveBeenCalledWith();
      expect(leadCoreService.newLead).toHaveBeenCalledWith(
        mockNewLeadRequestDto.phone_nr,
        mockSimulation,
      );
    });

    it('should handle LeadCoreService returning null', async () => {
      // Arrange
      leadCoreService.newLead.mockResolvedValue(null as any);

      const mockOwnerDto: OwnerDto = {
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 12,
        toOwner: jest.fn().mockReturnValue(mockOwner),
      };

      const mockNewLeadRequestDto: NewLeadRequestDto = {
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        phone_nr: '+1234567890',
        owners: [mockOwnerDto],
        asSimulation: jest.fn().mockReturnValue(mockSimulation),
      };

      // Act
      const result = await controller.newLead(mockNewLeadRequestDto);

      // Assert
      expect(result).toBeNull();
      expect(leadCoreService.newLead).toHaveBeenCalledWith(
        mockNewLeadRequestDto.phone_nr,
        mockSimulation,
      );
    });

    it('should handle LeadCoreService returning undefined', async () => {
      // Arrange
      leadCoreService.newLead.mockResolvedValue(undefined as any);

      const mockOwnerDto: OwnerDto = {
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 12,
        toOwner: jest.fn().mockReturnValue(mockOwner),
      };

      const mockNewLeadRequestDto: NewLeadRequestDto = {
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        phone_nr: '+1234567890',
        owners: [mockOwnerDto],
        asSimulation: jest.fn().mockReturnValue(mockSimulation),
      };

      // Act
      const result = await controller.newLead(mockNewLeadRequestDto);

      // Assert
      expect(result).toBeUndefined();
      expect(leadCoreService.newLead).toHaveBeenCalledWith(
        mockNewLeadRequestDto.phone_nr,
        mockSimulation,
      );
    });

    it('should handle asSimulation method throwing an error', async () => {
      // Arrange
      const error = new Error('Simulation creation error');

      const mockOwnerDto: OwnerDto = {
        type: 'FIRST',
        first_name: 'Mario',
        last_name: 'Bianchi',
        email: 'mbianchi@example.com',
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 12,
        toOwner: jest.fn().mockReturnValue(mockOwner),
      };

      const mockNewLeadRequestDto: NewLeadRequestDto = {
        amount: 50000,
        house_worth: 200000,
        city: 'Roma',
        phone_nr: '+1234567890',
        owners: [mockOwnerDto],
        asSimulation: jest.fn().mockImplementation(() => {
          throw error;
        }),
      };

      // Act & Assert
      await expect(controller.newLead(mockNewLeadRequestDto)).rejects.toThrow(
        'Simulation creation error',
      );
      expect(mockNewLeadRequestDto.asSimulation).toHaveBeenCalledWith();
      expect(leadCoreService.newLead).not.toHaveBeenCalled();
    });

    describe('controller instantiation', () => {
      it('should be defined', () => {
        expect(controller).toBeDefined();
      });

      it('should have the correct logger name', () => {
        expect(controller['logger']).toBeDefined();
        expect(controller['logger'].constructor.name).toBe('Logger');
      });

      it('should have the correct dependencies injected', () => {
        expect(controller['leadCoreService']).toBeDefined();
        expect(controller['leadCoreService']).toBe(leadCoreService);
      });
    });
  });
});
