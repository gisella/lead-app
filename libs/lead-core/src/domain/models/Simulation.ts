import { createHash } from 'crypto';
import { DateTime } from 'luxon';
import { Exclude, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class Owner {
  @ApiProperty({
    description: 'Type of owner (FIRST or SECOND)',
    enum: ['FIRST', 'SECOND'],
    example: 'FIRST',
  })
  type: 'FIRST' | 'SECOND';

  @ApiProperty({
    description: 'First name of the owner',
    example: 'John',
  })
  first_name: string;

  @ApiProperty({
    description: 'Last name of the owner',
    example: 'Doe',
  })
  last_name: string;

  @ApiProperty({
    description: 'Email address of the owner',
    example: 'john.doe@example.com',
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Birth date of the owner in ISO format',
    example: '1990-01-01',
  })
  birth_date: string;

  @ApiProperty({
    description: 'Monthly income of the owner',
    example: 5000,
  })
  monthly_income: number;

  @ApiProperty({
    description: 'Number of monthly payments (12, 13, or 14)',
    enum: [12, 13, 14],
    example: 12,
    required: false,
  })
  monthly_payments?: 12 | 13 | 14 | undefined;

  constructor(data: Partial<Owner>) {
    Object.assign(this, data);
  }

  toString() {
    return `${this.type}|${this.first_name?.trim() || ''}|${this.last_name?.trim() || ''}|${this.email?.trim() || ''}|${this.birth_date?.trim() || ''}|${this.monthly_income}|${this.monthly_payments || ''}`;
  }
}

export class Simulation {
  @ApiProperty({
    description: 'Loan amount requested',
    example: 200000,
  })
  amount: number;

  @ApiProperty({
    description: 'Estimated worth of the house',
    example: 300000,
  })
  house_worth: number;

  @ApiProperty({
    description: 'City where the property is located',
    example: 'Milano',
  })
  city: string;

  @Exclude()
  owners: Owner[];

  @Exclude()
  hash: string;

  @ApiProperty({
    description: 'Creation timestamp of the simulation',
    example: '2024-01-15T10:30:00.000Z',
  })
  @Transform(({ value }: { value: DateTime }) => value.toISODate())
  createdAt: DateTime;

  constructor(data: Partial<Simulation>) {
    Object.assign(this, data);
    if (!data.hash) {
      this.hash = this.toHash();
    }
  }

  toString() {
    return `${this.amount}|${this.house_worth}|${this.city?.trim() || ''}|${this.owners?.map((owner) => owner.toString()).join('|') || ''}`;
  }

  toHash(): string {
    return createHash('sha256').update(this.toString()).digest('hex');
  }

  getMinutesFromNow(): number {
    return this.createdAt.diffNow('minutes').minutes;
  }
}
