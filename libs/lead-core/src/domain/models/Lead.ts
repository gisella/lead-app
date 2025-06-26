import { IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Simulation } from '@app/lead-core/domain';

export class Lead {
  @ApiProperty()
  @IsNumber()
  id: number;

  @IsNumber()
  @ApiProperty()
  phoneNr: string;

  @ApiProperty()
  lastSimulation: Simulation | null;

  constructor(data: Partial<Lead>) {
    Object.assign(this, data);
  }
}
