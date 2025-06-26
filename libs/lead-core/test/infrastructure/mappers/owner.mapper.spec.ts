import { OwnerMapper } from '@app/lead-core/infrastructure/mappers/owner.mapper';
import { Owner } from '@app/lead-core/domain';

describe('OwnerMapper', () => {
  const dbOwner = {
    owner_type: 'FIRST',
    first_name: 'Mario',
    last_name: 'Bianchi',
    email: 'mbianchi@example.com',
    birth_date: new Date('1990-01-01'),
    monthly_income: BigInt(5000),
    monthly_payments: 12,
  };

  const domainOwner = new Owner({
    type: 'FIRST',
    first_name: 'Mario',
    last_name: 'Bianchi',
    email: 'mbianchi@example.com',
    birth_date: '1990-01-01',
    monthly_income: 5000,
    monthly_payments: 12,
  });

  describe('ownerToEntity', () => {
    it('should map dbOwner to Owner entity with all fields', () => {
      const owner = OwnerMapper.ownerToEntity(dbOwner);

      expect(owner).toBeInstanceOf(Owner);
      expect(owner.type).toBe('FIRST');
      expect(owner.first_name).toBe('Mario');
      expect(owner.last_name).toBe('Bianchi');
      expect(owner.email).toBe('mbianchi@example.com');
      expect(owner.birth_date).toBe('1990-01-01');
      expect(owner.monthly_income).toBe(5000);
      expect(owner.monthly_payments).toBe(12);
    });

    it('should handle missing owner_type by defaulting to FIRST', () => {
      const { owner_type, ...dbOwnerWithoutType } = dbOwner;

      const owner = OwnerMapper.ownerToEntity(dbOwnerWithoutType);
      expect(owner.type).toBe('FIRST');
    });

    it('should handle null owner_type by defaulting to FIRST', () => {
      const dbOwnerWithNullType = { ...dbOwner, owner_type: null };

      const owner = OwnerMapper.ownerToEntity(dbOwnerWithNullType);
      expect(owner.type).toBe('FIRST');
    });

    it('should handle SECOND owner_type', () => {
      const dbOwnerSecond = { ...dbOwner, owner_type: 'SECOND' };

      const owner = OwnerMapper.ownerToEntity(dbOwnerSecond);
      expect(owner.type).toBe('SECOND');
    });

    it('should handle missing email by setting it to undefined', () => {
      const { email, ...dbOwnerWithoutEmail } = dbOwner;

      const owner = OwnerMapper.ownerToEntity(dbOwnerWithoutEmail);
      expect(owner.email).toBeUndefined();
    });

    it('should handle null email by setting it to undefined', () => {
      const dbOwnerWithNullEmail = { ...dbOwner, email: null };

      const owner = OwnerMapper.ownerToEntity(dbOwnerWithNullEmail);
      expect(owner.email).toBeUndefined();
    });

    it('should convert BigInt monthly_income to number', () => {
      const dbOwnerWithBigInt = { ...dbOwner, monthly_income: BigInt(7500) };

      const owner = OwnerMapper.ownerToEntity(dbOwnerWithBigInt);
      expect(owner.monthly_income).toBe(7500);
      expect(typeof owner.monthly_income).toBe('number');
    });

    it('should handle missing monthly_payments by setting it to undefined', () => {
      const { monthly_payments, ...dbOwnerWithoutPayments } = dbOwner;

      const owner = OwnerMapper.ownerToEntity(dbOwnerWithoutPayments);
      expect(owner.monthly_payments).toBeUndefined();
    });

    it('should handle null monthly_payments by setting it to undefined', () => {
      const dbOwnerWithNullPayments = { ...dbOwner, monthly_payments: null };

      const owner = OwnerMapper.ownerToEntity(dbOwnerWithNullPayments);
      expect(owner.monthly_payments).toBeUndefined();
    });

    it('should handle all valid monthly_payments values', () => {
      const validPayments = [12, 13, 14];

      for (const payment of validPayments) {
        const dbOwnerWithPayment = { ...dbOwner, monthly_payments: payment };
        const owner = OwnerMapper.ownerToEntity(dbOwnerWithPayment);
        expect(owner.monthly_payments).toBe(payment);
      }
    });

    it('should convert Date birth_date to ISO string format', () => {
      const specificDate = new Date('1985-06-15T10:30:00Z');
      const dbOwnerWithDate = { ...dbOwner, birth_date: specificDate };

      const owner = OwnerMapper.ownerToEntity(dbOwnerWithDate);
      expect(owner.birth_date).toBe('1985-06-15');
    });
  });

  describe('ownerToDbEntity', () => {
    it('should map Owner entity to dbOwner with all fields', () => {
      const leadRequestId = 123;
      const dbEntity = OwnerMapper.ownerToDbEntity(domainOwner, leadRequestId);

      expect(dbEntity.lead_request_id).toBe(leadRequestId);
      expect(dbEntity.owner_type).toBe('FIRST');
      expect(dbEntity.first_name).toBe('Mario');
      expect(dbEntity.last_name).toBe('Bianchi');
      expect(dbEntity.email).toBe('mbianchi@example.com');
      expect(dbEntity.birth_date).toEqual(new Date('1990-01-01'));
      expect(dbEntity.monthly_income).toEqual(BigInt(5000));
      expect(dbEntity.monthly_payments).toBe(12);
    });

    it('should handle undefined email by setting it to null', () => {
      const ownerWithoutEmail = new Owner({
        type: 'SECOND',
        first_name: 'Jane',
        last_name: 'Bianchi',
        birth_date: '1992-05-15',
        monthly_income: 4500,
        monthly_payments: 13,
      });

      const leadRequestId = 456;
      const dbEntity = OwnerMapper.ownerToDbEntity(
        ownerWithoutEmail,
        leadRequestId,
      );

      expect(dbEntity.email).toBeNull();
      expect(dbEntity.owner_type).toBe('SECOND');
      expect(dbEntity.first_name).toBe('Jane');
      expect(dbEntity.last_name).toBe('Bianchi');
      expect(dbEntity.birth_date).toEqual(new Date('1992-05-15'));
      expect(dbEntity.monthly_income).toEqual(BigInt(4500));
      expect(dbEntity.monthly_payments).toBe(13);
    });

    it('should handle undefined monthly_payments by setting it to null', () => {
      const ownerWithoutPayments = new Owner({
        type: 'FIRST',
        first_name: 'Bob',
        last_name: 'Smith',
        email: 'bob.smith@example.com',
        birth_date: '1988-12-03',
        monthly_income: 6000,
      });

      const leadRequestId = 789;
      const dbEntity = OwnerMapper.ownerToDbEntity(
        ownerWithoutPayments,
        leadRequestId,
      );

      expect(dbEntity.monthly_payments).toBeNull();
      expect(dbEntity.email).toBe('bob.smith@example.com');
      expect(dbEntity.monthly_income).toEqual(BigInt(6000));
    });

    it('should convert number monthly_income to BigInt', () => {
      const ownerWithNumber = new Owner({
        type: 'FIRST',
        first_name: 'Alice',
        last_name: 'Johnson',
        birth_date: '1995-03-20',
        monthly_income: 8000,
        monthly_payments: 14,
      });

      const leadRequestId = 999;
      const dbEntity = OwnerMapper.ownerToDbEntity(
        ownerWithNumber,
        leadRequestId,
      );

      expect(dbEntity.monthly_income).toEqual(BigInt(8000));
      expect(typeof dbEntity.monthly_income).toBe('bigint');
    });

    it('should convert string birth_date to Date object', () => {
      const ownerWithStringDate = new Owner({
        type: 'SECOND',
        first_name: 'Charlie',
        last_name: 'Brown',
        birth_date: '1980-11-25',
        monthly_income: 3500,
        monthly_payments: 12,
      });

      const leadRequestId = 111;
      const dbEntity = OwnerMapper.ownerToDbEntity(
        ownerWithStringDate,
        leadRequestId,
      );

      expect(dbEntity.birth_date).toEqual(new Date('1980-11-25'));
      expect(dbEntity.birth_date).toBeInstanceOf(Date);
    });
  });

  describe('ownersToDbEntities', () => {
    it('should map array of Owner entities to array of dbOwner objects', () => {
      const owners = [
        new Owner({
          type: 'FIRST',
          first_name: 'Mario',
          last_name: 'Bianchi',
          email: 'mbianchi@example.com',
          birth_date: '1990-01-01',
          monthly_income: 5000,
          monthly_payments: 12,
        }),
        new Owner({
          type: 'SECOND',
          first_name: 'Jane',
          last_name: 'Bianchi',
          email: 'jane.Bianchi@example.com',
          birth_date: '1992-05-15',
          monthly_income: 4500,
          monthly_payments: 13,
        }),
      ];

      const leadRequestId = 123;
      const dbEntities = OwnerMapper.ownersToDbEntities(owners, leadRequestId);

      expect(dbEntities).toHaveLength(2);
      expect(dbEntities[0].lead_request_id).toBe(leadRequestId);
      expect(dbEntities[0].owner_type).toBe('FIRST');
      expect(dbEntities[0].first_name).toBe('Mario');
      expect(dbEntities[1].lead_request_id).toBe(leadRequestId);
      expect(dbEntities[1].owner_type).toBe('SECOND');
      expect(dbEntities[1].first_name).toBe('Jane');
    });

    it('should handle empty array of owners', () => {
      const owners: Owner[] = [];
      const leadRequestId = 456;
      const dbEntities = OwnerMapper.ownersToDbEntities(owners, leadRequestId);

      expect(dbEntities).toHaveLength(0);
      expect(Array.isArray(dbEntities)).toBe(true);
    });

    it('should handle single owner in array', () => {
      const owners = [
        new Owner({
          type: 'FIRST',
          first_name: 'Single',
          last_name: 'Owner',
          birth_date: '1985-08-10',
          monthly_income: 7000,
          monthly_payments: 14,
        }),
      ];

      const leadRequestId = 789;
      const dbEntities = OwnerMapper.ownersToDbEntities(owners, leadRequestId);

      expect(dbEntities).toHaveLength(1);
      expect(dbEntities[0].lead_request_id).toBe(leadRequestId);
      expect(dbEntities[0].first_name).toBe('Single');
      expect(dbEntities[0].monthly_income).toEqual(BigInt(7000));
    });

    it('should handle owners with undefined optional fields', () => {
      const owners = [
        new Owner({
          type: 'FIRST',
          first_name: 'NoEmail',
          last_name: 'Owner',
          birth_date: '1990-01-01',
          monthly_income: 5000,
        }),
        new Owner({
          type: 'SECOND',
          first_name: 'NoPayments',
          last_name: 'Owner',
          email: 'nopayments@example.com',
          birth_date: '1992-01-01',
          monthly_income: 4500,
        }),
      ];

      const leadRequestId = 999;
      const dbEntities = OwnerMapper.ownersToDbEntities(owners, leadRequestId);

      expect(dbEntities).toHaveLength(2);
      expect(dbEntities[0].email).toBeNull();
      expect(dbEntities[0].monthly_payments).toBeNull();
      expect(dbEntities[1].email).toBe('nopayments@example.com');
      expect(dbEntities[1].monthly_payments).toBeNull();
    });
  });

  describe('integration tests', () => {
    it('should maintain data integrity through round-trip conversion', () => {
      const originalDbOwner = {
        owner_type: 'SECOND',
        first_name: 'Test',
        last_name: 'User',
        email: 'test.user@example.com',
        birth_date: new Date('1988-06-15'),
        monthly_income: BigInt(6500),
        monthly_payments: 13,
      };

      // Convert to domain entity
      const domainEntity = OwnerMapper.ownerToEntity(originalDbOwner);

      // Convert back to db entity
      const leadRequestId = 123;
      const convertedDbOwner = OwnerMapper.ownerToDbEntity(
        domainEntity,
        leadRequestId,
      );

      // Verify data integrity
      expect(convertedDbOwner.owner_type).toBe(originalDbOwner.owner_type);
      expect(convertedDbOwner.first_name).toBe(originalDbOwner.first_name);
      expect(convertedDbOwner.last_name).toBe(originalDbOwner.last_name);
      expect(convertedDbOwner.email).toBe(originalDbOwner.email);
      expect(convertedDbOwner.birth_date).toEqual(originalDbOwner.birth_date);
      expect(convertedDbOwner.monthly_income).toEqual(
        originalDbOwner.monthly_income,
      );
      expect(convertedDbOwner.monthly_payments).toBe(
        originalDbOwner.monthly_payments,
      );
      expect(convertedDbOwner.lead_request_id).toBe(leadRequestId);
    });
  });
});
