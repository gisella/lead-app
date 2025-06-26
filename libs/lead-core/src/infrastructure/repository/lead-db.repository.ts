import {
  Lead,
  LeadDbRepositoryI,
  LeadSearchParams,
  Simulation,
} from '@app/lead-core/domain';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@db/prisma/src';
import { SimulationMapper } from '@app/lead-core/infrastructure/mappers/simulation.mapper';
import { OwnerMapper } from '@app/lead-core/infrastructure/mappers/owner.mapper';
import { LeadMapper } from '@app/lead-core/infrastructure/mappers/lead.mapper';
import { Prisma } from '@db/prisma/src/database/client/lead';

export class LeadDbRepository extends LeadDbRepositoryI {
  private readonly logger = new Logger(LeadDbRepository.name);

  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async insertLead(lead: Lead): Promise<Lead> {
    try {
      const createdLead = await this.prismaService.leads.create({
        data: LeadMapper.toDbEntity(lead),
      });

      this.logger.log(`Lead created with ID: ${createdLead.id}`);
      return LeadMapper.toEntity(createdLead);
    } catch (error) {
      this.logger.error('Failed to insert lead:', error);
      throw error;
    }
  }

  async addSimulation(
    leadId: number,
    simulation: Simulation,
    trx?: Prisma.TransactionClient,
  ): Promise<Simulation> {
    try {
      const createdSimulation = await (
        trx ?? this.prismaService
      ).lead_requests.create({
        data: {
          lead_id: leadId,
          amount: BigInt(simulation.amount),
          house_worth: BigInt(simulation.house_worth),
          city: simulation.city,
          hash: simulation.toHash(),
        },
      });

      const ownerEntities = OwnerMapper.ownersToDbEntities(
        simulation.owners,
        Number(createdSimulation.id),
      );

      await (trx ?? this.prismaService).owners.createMany({
        data: ownerEntities,
      });

      this.logger.log(`Simulation created with ID: ${createdSimulation.id}`);
      return SimulationMapper.toEntity(createdSimulation);
    } catch (error) {
      this.logger.error('Failed to add simulation:', error);
      throw error;
    }
  }

  async findLeadBy(searchParams: LeadSearchParams): Promise<Lead | null> {
    try {
      const lead = await this.prismaService.leads.findUnique({
        where: {
          phone_nr: searchParams.phoneNr,
        },
        include: {
          lead_requests: {
            orderBy: {
              created_at: 'desc',
            },
            take: 1,
            include: {
              owners: {
                orderBy: {
                  id: 'asc',
                },
              },
            },
          },
        },
      });

      if (!lead) {
        return null;
      }

      return LeadMapper.toEntityWithSimulation(
        lead,
        lead.lead_requests[0] || undefined,
      );
    } catch (error) {
      this.logger.error(
        `Error fetching lead for phone number ${searchParams.phoneNr}:`,
        error,
      );
      return null;
    }
  }
}
