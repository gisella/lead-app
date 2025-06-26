import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  IsIn,
  IsOptional,
  ArrayMinSize,
  IsEmail,
  ArrayNotEmpty,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsAdult } from '../decorators/is-adult.decorator';
import { Simulation, Owner as DomainOwner } from '@app/lead-core';
import { Type } from 'class-transformer';

export class OwnerDto {
  @ApiProperty({
    description: 'Type of owner (FIRST or SECOND)',
    enum: ['FIRST', 'SECOND'],
    example: 'FIRST',
  })
  @IsIn(['FIRST', 'SECOND'])
  type: 'FIRST' | 'SECOND';

  @ApiProperty({
    description: 'First name of the owner',
    example: 'Mario',
  })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  first_name: string;

  @ApiProperty({
    description: 'Last name of the owner',
    example: 'Bianchi',
  })
  @IsString()
  @IsNotEmpty()
  @IsDefined()
  last_name: string;

  @ApiPropertyOptional({
    description: 'Email address of the owner',
    example: 'mbianchi@example.com',
  })
  @IsEmail()
  email?: string;

  @ApiProperty({
    description:
      'Birth date of the owner (YYYY-MM-DD format) - Must be at least 18 years old',
    example: '1990-01-01',
  })
  @IsNotEmpty()
  @IsDateString({ strict: true })
  @IsAdult({ message: 'Owner must be at least 18 years old' })
  birth_date: string;

  @ApiProperty({
    description: 'Monthly income of the owner',
    example: 5000,
  })
  @IsNumber()
  @IsNotEmpty()
  monthly_income: number;

  @ApiPropertyOptional({
    description: 'Number of monthly payments (12, 13, or 14)',
    enum: [12, 13, 14],
    example: 12,
  })
  @IsOptional()
  @IsNumber()
  @IsIn([12, 13, 14])
  monthly_payments?: 12 | 13 | 14;

  toOwner(): DomainOwner {
    return new DomainOwner({
      type: this.type,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      birth_date: this.birth_date,
      monthly_income: this.monthly_income,
      monthly_payments: this.monthly_payments,
    });
  }
}

export class NewLeadRequestDto {
  @ApiProperty({
    description: 'Loan amount requested (minimum 1000)',
    minimum: 1000,
    example: 50000,
  })
  @IsNumber()
  @IsNotEmpty()
  @Min(1000)
  amount: number;

  @ApiProperty({
    description: 'Estimated value of the house (minimum 1000)',
    minimum: 1000,
    example: 200000,
  })
  @IsNumber()
  @Min(1000)
  @IsNotEmpty()
  house_worth: number;

  @ApiProperty({
    description: 'City where the property is located',
    example: 'Roma',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Phone number of the applicant',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  //@IsAPhoneNumber()
  phone_nr: string;

  @ApiProperty({
    description: 'List of property owners (at least one required)',
    type: [OwnerDto],
    isArray: true,
    minItems: 1,
    example: [
      {
        first_name: 'Mario',
        last_name: 'Bianchi',
        type: 'FIRST',
        email: 'mbianchi@example.com',
        birth_date: '1990-01-01',
        monthly_income: 5000,
        monthly_payments: 12,
      },
    ],
  })
  @ArrayMinSize(1, { message: 'At least one owner must be provided' })
  @ArrayNotEmpty({ message: 'At least one owner must be provided' })
  @ValidateNested({ each: true })
  @Type(() => OwnerDto)
  owners: OwnerDto[];

  asSimulation(): Simulation {
    return new Simulation({
      amount: this.amount,
      house_worth: this.house_worth,
      city: this.city,
      owners: this.owners.map((ownerDto) => ownerDto.toOwner()),
    });
  }
}
