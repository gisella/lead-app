import { Body, Controller, Logger, Post } from '@nestjs/common';
import { Lead, LeadCoreService } from '@app/lead-core/domain';
import { ApiBody, ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { NewLeadRequestDto } from '../dto/new-lead-request.dto';

@ApiTags('Lead Management')
@Controller('lead-service')
export class LeadServiceController {
  private readonly logger = new Logger(LeadServiceController.name);

  constructor(private readonly leadCoreService: LeadCoreService) {}

  @Post('/')
  @ApiOperation({
    summary: 'Create a new lead request',
    description:
      'Creates a new lead with simulation data and owner information',
  })
  @ApiBody({
    type: NewLeadRequestDto,
    description:
      'Lead request data including loan amount, property details, and owner information',
  })
  @ApiResponse({
    status: 201,
    description: 'Lead created successfully',
    type: Lead,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async newLead(@Body() newLeadRequest: NewLeadRequestDto): Promise<Lead> {
    this.logger.log(
      `Creating new lead for phone number: ${newLeadRequest.phone_nr}`,
    );

    return this.leadCoreService.newLead(
      newLeadRequest.phone_nr,
      newLeadRequest.asSimulation(),
    );
  }
}
