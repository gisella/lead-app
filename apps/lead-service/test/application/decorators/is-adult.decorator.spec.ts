import { checkIsAdult } from '../../../src/application/decorators/is-adult.decorator';

describe('checkIsAdult Function', () => {
  describe('validate method', () => {
    it('should return false for null values', () => {
      const result = checkIsAdult(null as any);
      expect(result).toBe(false);
    });

    it('should return false for undefined values', () => {
      const result = checkIsAdult(undefined as any);
      expect(result).toBe(false);
    });

    it('should return false for empty string', () => {
      const result = checkIsAdult('');
      expect(result).toBe(false);
    });

    it('should return false for invalid date string', () => {
      const result = checkIsAdult('invalid-date');
      expect(result).toBe(false);
    });

    it('should return false for person under 18 years old', () => {
      // Create a date for someone who is 17 years old
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 17,
        today.getMonth(),
        today.getDate(),
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(false);
    });

    it('should return true for person exactly 18 years old', () => {
      // Create a date for someone who is exactly 18 years old
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate(),
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(true);
    });

    it('should return true for person over 18 years old', () => {
      // Create a date for someone who is 25 years old
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 25,
        today.getMonth(),
        today.getDate(),
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(true);
    });

    it('should return true for person exactly 100 years old', () => {
      // Create a date for someone who is exactly 100 years old
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 100,
        today.getMonth(),
        today.getDate(),
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(true);
    });

    it('should return false for person over 100 years old', () => {
      // Create a date for someone who is 101 years old
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 101,
        today.getMonth(),
        today.getDate(),
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(false);
    });

    it('should handle birthday not yet occurred this year for 18 year old', () => {
      // Create a date for someone who will turn 18 later this year
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 18,
        today.getMonth() + 1,
        today.getDate(),
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(false); // Should be 17 until birthday
    });

    it('should handle birthday not yet occurred this year for 19 year old', () => {
      // Create a date for someone who will turn 19 later this year (currently 18)
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 19,
        today.getMonth() + 1,
        today.getDate(),
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(true); // Should be 18 until birthday
    });

    it('should handle birthday not yet occurred this month for 18 year old', () => {
      // Create a date for someone who will turn 18 later this month
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate() + 1,
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(false); // Should be 17 until birthday
    });

    it('should handle birthday not yet occurred this month for 19 year old', () => {
      // Create a date for someone who will turn 19 later this month (currently 18)
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 19,
        today.getMonth(),
        today.getDate() + 1,
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(true); // Should be 18 until birthday
    });

    it('should handle birthday that occurred yesterday for 18 year old', () => {
      // Create a date for someone who turned 18 yesterday
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate() - 1,
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(true); // Should be 18
    });

    it('should handle birthday that occurred yesterday for 17 year old', () => {
      // Create a date for someone who turned 17 yesterday
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 17,
        today.getMonth(),
        today.getDate() - 1,
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(false); // Should be 17
    });

    it('should work with ISO date format', () => {
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 25,
        today.getMonth(),
        today.getDate(),
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle very old dates', () => {
      const veryOldDate = new Date('1900-01-01');
      const result = checkIsAdult(veryOldDate.toISOString());
      expect(result).toBe(false); // Should be over 100 years old
    });

    it('should handle future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const result = checkIsAdult(futureDate.toISOString());
      expect(result).toBe(false); // Future date should be invalid
    });

    it('should handle dates with time components', () => {
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 25,
        today.getMonth(),
        today.getDate(),
        12,
        30,
        45,
        123,
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(true); // Should work with time components
    });

    it('should handle same day birthday for 18 year old', () => {
      // Create a date for someone who turns 18 today
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 18,
        today.getMonth(),
        today.getDate(),
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(true); // Should be 18 on birthday
    });

    it('should handle same day birthday for 17 year old', () => {
      // Create a date for someone who turns 17 today
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 17,
        today.getMonth(),
        today.getDate(),
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(false); // Should be 17 on birthday
    });

    it('should handle leap year birthdays', () => {
      // Test for someone born on February 29th
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 25,
        1, // February (0-indexed)
        29,
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(true);
    });

    it('should handle month with different number of days', () => {
      // Test for someone born on January 31st
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 25,
        0, // January (0-indexed)
        31,
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(true);
    });

    it('should handle year boundary cases for under 18', () => {
      // Test for someone born on December 31st who is 17
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 17,
        11, // December (0-indexed)
        31,
      );

      const result = checkIsAdult(birthDate.toISOString());
      expect(result).toBe(false);
    });
  });
});
