import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaClient } from './client/lead';

export type PrismaClientDb = PrismaClient;

@Injectable()
export class TransactionManager {
  private readonly logger = new Logger(TransactionManager.name);

  constructor(private readonly client: PrismaService) {}

  async executeTransaction<T>(
    callback: (transaction: PrismaClientDb) => Promise<T>,
    timeout = 100000,
  ): Promise<T> {
    try {
      this.logger.debug('TransactionManager executeTransaction');
      return await this.client.$transaction(
        (transaction: PrismaClientDb) => callback(transaction),
        { timeout },
      );
    } catch (error) {
      this.logger.error('Transaction failed:', error);
      throw error;
    }
  }
}
