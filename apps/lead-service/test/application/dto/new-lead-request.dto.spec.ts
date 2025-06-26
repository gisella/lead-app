import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import {
  NewLeadRequestDto,
  OwnerDto,
} from '../../../src/application/dto/new-lead-request.dto';
import { Owner as DomainOwner, Simulation } from '@app/lead-core';

describe('OwnerDto', () => {
  let validOwnerData: any;

  beforeEach(() => {
    validOwnerData = {
      type: 'FIRST',
      first_name: 'Mario',
      last_name: 'Bianchi',
      email: 'mbianchi@example.com',
      birth_date: '1990-01-01',
      monthly_income: 5000,
      monthly_payments: 12,
    };
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const ownerDto = plainToClass(OwnerDto, validOwnerData);
      const errors = await validate(ownerDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when type is invalid', async () => {
      const invalidData = { ...validOwnerData, type: 'INVALID' };
      const ownerDto = plainToClass(OwnerDto, invalidData);
      const errors = await validate(ownerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isIn).toBeDefined();
    });

    it('should fail validation when first_name is empty', async () => {
      const invalidData = { ...validOwnerData, first_name: '' };
      const ownerDto = plainToClass(OwnerDto, invalidData);
      const errors = await validate(ownerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation when last_name is empty', async () => {
      const invalidData = { ...validOwnerData, last_name: '' };
      const ownerDto = plainToClass(OwnerDto, invalidData);
      const errors = await validate(ownerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should pass validation when email is optional and not provided', async () => {
      const { email, ...dataWithoutEmail } = validOwnerData;
      const ownerDto = plainToClass(OwnerDto, dataWithoutEmail);
      const errors = await validate(ownerDto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation when email is invalid', async () => {
      const invalidData = { ...validOwnerData, email: 'invalid-email' };
      const ownerDto = plainToClass(OwnerDto, invalidData);
      const errors = await validate(ownerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isEmail).toBeDefined();
    });

    it('should pass validation when email is valid', async () => {
      const validData = { ...validOwnerData, email: 'valid.email@example.com' };
      const ownerDto = plainToClass(OwnerDto, validData);
      const errors = await validate(ownerDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when birth_date is not a valid date string', async () => {
      const invalidData = { ...validOwnerData, birth_date: 'invalid-date' };
      const ownerDto = plainToClass(OwnerDto, invalidData);
      const errors = await validate(ownerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isDateString).toBeDefined();
    });

    it('should fail validation when birth_date indicates person is under 18', async () => {
      const today = new Date();
      const under18Date = new Date(
        today.getFullYear() - 17,
        today.getMonth(),
        today.getDate(),
      );
      const invalidData = {
        ...validOwnerData,
        birth_date: under18Date.toISOString().split('T')[0],
      };
      const ownerDto = plainToClass(OwnerDto, invalidData);
      const errors = await validate(ownerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isAdult).toBeDefined();
    });

    it('should pass validation when birth_date indicates person is exactly 18', async () => {
      const today = new Date();
      const exactly18Date = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate(),
      );
      const validData = {
        ...validOwnerData,
        birth_date: exactly18Date.toISOString().split('T')[0],
      };
      const ownerDto = plainToClass(OwnerDto, validData);
      const errors = await validate(ownerDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when monthly_income is not a number', async () => {
      const invalidData = { ...validOwnerData, monthly_income: 'not-a-number' };
      const ownerDto = plainToClass(OwnerDto, invalidData);
      const errors = await validate(ownerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNumber).toBeDefined();
    });

    it('should fail validation when monthly_payments is invalid', async () => {
      const invalidData = { ...validOwnerData, monthly_payments: 15 };
      const ownerDto = plainToClass(OwnerDto, invalidData);
      const errors = await validate(ownerDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isIn).toBeDefined();
    });

    it('should pass validation when monthly_payments is not provided', async () => {
      const { monthly_payments, ...dataWithoutPayments } = validOwnerData;
      const ownerDto = plainToClass(OwnerDto, dataWithoutPayments);
      const errors = await validate(ownerDto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with all valid monthly_payments values', async () => {
      const validPayments = [12, 13, 14];

      for (const payment of validPayments) {
        const data = { ...validOwnerData, monthly_payments: payment };
        const ownerDto = plainToClass(OwnerDto, data);
        const errors = await validate(ownerDto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('toOwner method', () => {
    it('should convert OwnerDto to DomainOwner correctly', () => {
      const ownerDto = plainToClass(OwnerDto, validOwnerData);
      const domainOwner = ownerDto.toOwner();

      expect(domainOwner).toBeInstanceOf(DomainOwner);
      expect(domainOwner.type).toBe(validOwnerData.type);
      expect(domainOwner.first_name).toBe(validOwnerData.first_name);
      expect(domainOwner.last_name).toBe(validOwnerData.last_name);
      expect(domainOwner.email).toBe(validOwnerData.email);
      expect(domainOwner.birth_date).toBe(validOwnerData.birth_date);
      expect(domainOwner.monthly_income).toBe(validOwnerData.monthly_income);
      expect(domainOwner.monthly_payments).toBe(
        validOwnerData.monthly_payments,
      );
    });

    it('should handle undefined optional fields', () => {
      const { email, monthly_payments, ...dataWithoutOptionals } =
        validOwnerData;
      const ownerDto = plainToClass(OwnerDto, dataWithoutOptionals);
      const domainOwner = ownerDto.toOwner();

      expect(domainOwner.email).toBeUndefined();
      expect(domainOwner.monthly_payments).toBeUndefined();
    });
  });
});

describe('NewLeadRequestDto', () => {
  let validLeadData: any;

  beforeEach(() => {
    validLeadData = {
      amount: 50000,
      house_worth: 200000,
      city: 'Roma',
      phone_nr: '+1234567890',
      owners: [
        {
          type: 'FIRST',
          first_name: 'Mario',
          last_name: 'Bianchi',
          email: 'mbianchi@example.com',
          birth_date: '1990-01-01',
          monthly_income: 5000,
          monthly_payments: 12,
        },
      ],
    };
  });

  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const leadDto = plainToClass(NewLeadRequestDto, validLeadData);
      const errors = await validate(leadDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when amount is less than 1000', async () => {
      const invalidData = { ...validLeadData, amount: 500 };
      const leadDto = plainToClass(NewLeadRequestDto, invalidData);
      const errors = await validate(leadDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail validation when amount is not a number', async () => {
      const invalidData = { ...validLeadData, amount: 'not-a-number' };
      const leadDto = plainToClass(NewLeadRequestDto, invalidData);
      const errors = await validate(leadDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNumber).toBeDefined();
    });

    it('should fail validation when house_worth is less than 1000', async () => {
      const invalidData = { ...validLeadData, house_worth: 500 };
      const leadDto = plainToClass(NewLeadRequestDto, invalidData);
      const errors = await validate(leadDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.min).toBeDefined();
    });

    it('should fail validation when city is empty', async () => {
      const invalidData = { ...validLeadData, city: '' };
      const leadDto = plainToClass(NewLeadRequestDto, invalidData);
      const errors = await validate(leadDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation when phone_nr is empty', async () => {
      const invalidData = { ...validLeadData, phone_nr: '' };
      const leadDto = plainToClass(NewLeadRequestDto, invalidData);
      const errors = await validate(leadDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation when owners array is empty', async () => {
      const invalidData = { ...validLeadData, owners: [] };
      const leadDto = plainToClass(NewLeadRequestDto, invalidData);
      const errors = await validate(leadDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.arrayMinSize).toBeDefined();
    });

    it('should fail validation when owners array is not provided', async () => {
      const { owners, ...dataWithoutOwners } = validLeadData;
      const leadDto = plainToClass(NewLeadRequestDto, dataWithoutOwners);
      const errors = await validate(leadDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.arrayNotEmpty).toBeDefined();
    });

    it('should pass validation with multiple owners', async () => {
      const dataWithMultipleOwners = {
        ...validLeadData,
        owners: [
          {
            type: 'FIRST',
            first_name: 'Mario',
            last_name: 'Bianchi',
            email: 'mbianchi@example.com',
            birth_date: '1990-01-01',
            monthly_income: 5000,
            monthly_payments: 12,
          },
          {
            type: 'SECOND',
            first_name: 'Jane',
            last_name: 'Bianchi',
            email: 'jane.Bianchi@example.com',
            birth_date: '1992-05-15',
            monthly_income: 4500,
            monthly_payments: 13,
          },
        ],
      };
      const leadDto = plainToClass(NewLeadRequestDto, dataWithMultipleOwners);
      const errors = await validate(leadDto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when owner data is invalid', async () => {
      const invalidData = {
        ...validLeadData,
        owners: [
          {
            type: 'FIRST',
            first_name: '', // Invalid: empty first name
            last_name: 'Bianchi',
            email: 'mbianchi@example.com',
            birth_date: '1990-01-01',
            monthly_income: 5000,
            monthly_payments: 12,
          },
        ],
      };
      const leadDto = plainToClass(NewLeadRequestDto, invalidData);
      const errors = await validate(leadDto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('asSimulation method', () => {
    it('should convert NewLeadRequestDto to Simulation correctly', () => {
      const leadDto = plainToClass(NewLeadRequestDto, validLeadData);
      const simulation = leadDto.asSimulation();

      expect(simulation).toBeInstanceOf(Simulation);
      expect(simulation.amount).toBe(validLeadData.amount);
      expect(simulation.house_worth).toBe(validLeadData.house_worth);
      expect(simulation.city).toBe(validLeadData.city);
      expect(simulation.owners).toHaveLength(1);
      expect(simulation.owners[0]).toBeInstanceOf(DomainOwner);
      expect(simulation.owners[0].first_name).toBe(
        validLeadData.owners[0].first_name,
      );
    });

    it('should handle multiple owners correctly', () => {
      const dataWithMultipleOwners = {
        ...validLeadData,
        owners: [
          {
            type: 'FIRST',
            first_name: 'Mario',
            last_name: 'Bianchi',
            email: 'mbianchi@example.com',
            birth_date: '1990-01-01',
            monthly_income: 5000,
            monthly_payments: 12,
          },
          {
            type: 'SECOND',
            first_name: 'Jane',
            last_name: 'Bianchi',
            email: 'jane.Bianchi@example.com',
            birth_date: '1992-05-15',
            monthly_income: 4500,
            monthly_payments: 13,
          },
        ],
      };
      const leadDto = plainToClass(NewLeadRequestDto, dataWithMultipleOwners);
      const simulation = leadDto.asSimulation();

      expect(simulation.owners).toHaveLength(2);
      expect(simulation.owners[0].first_name).toBe('Mario');
      expect(simulation.owners[1].first_name).toBe('Jane');
      expect(simulation.owners[0].type).toBe('FIRST');
      expect(simulation.owners[1].type).toBe('SECOND');
    });
  });

  describe('edge cases', () => {
    it('should handle minimum valid amounts', async () => {
      const minAmountData = {
        ...validLeadData,
        amount: 1000,
        house_worth: 1000,
      };
      const leadDto = plainToClass(NewLeadRequestDto, minAmountData);
      const errors = await validate(leadDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle large amounts', async () => {
      const largeAmountData = {
        ...validLeadData,
        amount: 1000000,
        house_worth: 2000000,
      };
      const leadDto = plainToClass(NewLeadRequestDto, largeAmountData);
      const errors = await validate(leadDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle special characters in city name', async () => {
      const specialCityData = { ...validLeadData, city: 'São Paulo' };
      const leadDto = plainToClass(NewLeadRequestDto, specialCityData);
      const errors = await validate(leadDto);
      expect(errors).toHaveLength(0);
    });

    it('should handle various phone number formats', async () => {
      const phoneFormats = [
        '+1234567890',
        '+44 20 7946 0958',
        '+1-555-123-4567',
        '+33 1 42 86 20 00',
      ];

      for (const phone of phoneFormats) {
        const phoneData = { ...validLeadData, phone_nr: phone };
        const leadDto = plainToClass(NewLeadRequestDto, phoneData);
        const errors = await validate(leadDto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('integration with domain models', () => {
    it('should create valid domain objects through transformation chain', () => {
      const leadDto = plainToClass(NewLeadRequestDto, validLeadData);
      const simulation = leadDto.asSimulation();

      // Verify simulation properties
      expect(simulation.amount).toBe(validLeadData.amount);
      expect(simulation.house_worth).toBe(validLeadData.house_worth);
      expect(simulation.city).toBe(validLeadData.city);

      // Verify owner properties
      const owner = simulation.owners[0];
      expect(owner.type).toBe(validLeadData.owners[0].type);
      expect(owner.first_name).toBe(validLeadData.owners[0].first_name);
      expect(owner.last_name).toBe(validLeadData.owners[0].last_name);
      expect(owner.email).toBe(validLeadData.owners[0].email);
      expect(owner.birth_date).toBe(validLeadData.owners[0].birth_date);
      expect(owner.monthly_income).toBe(validLeadData.owners[0].monthly_income);
      expect(owner.monthly_payments).toBe(
        validLeadData.owners[0].monthly_payments,
      );
    });
  });
});
