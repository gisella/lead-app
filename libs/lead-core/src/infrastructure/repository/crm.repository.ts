import { CrmRepositoryI, Lead } from '@app/lead-core';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom, timeout, retry, throwError } from 'rxjs';
import { AxiosError } from 'axios';
import { Logger } from '@nestjs/common';
import { ExternalServiceException } from '@app/lead-core';

export class CrmRepository extends CrmRepositoryI {
  private readonly logger = new Logger(CrmRepository.name);
  private readonly CRM_API_URL: string;
  private readonly TIMEOUT_MS = 5000;
  private readonly MAX_RETRIES = 3;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    super();
    this.CRM_API_URL = configService.getOrThrow<string>('CRM_API_URL');
  }

  async syncLead(lead: Lead): Promise<void> {
    await firstValueFrom(
      this.httpService.post(this.CRM_API_URL + '/lead', lead).pipe(
        timeout(this.TIMEOUT_MS),
        retry({
          count: this.MAX_RETRIES,
          delay: 1000,
        }),
        catchError((error: AxiosError) => {
          this.logger.error(
            `Failed to sync lead ${lead.id} after ${this.MAX_RETRIES} retries:`,
            error,
          );
          return throwError(() => this.handleAxiosException(error));
        }),
      ),
    );
  }

  private handleAxiosException(e: AxiosError): ExternalServiceException {
    if (e.code === 'ECONNREFUSED') {
      return new ExternalServiceException('Connection Refused', '400');
    } else if (e.code === 'ETIMEDOUT') {
      return new ExternalServiceException('Request Timeout', '408');
    } else {
      return new ExternalServiceException(
        e.message || 'Unknown error',
        e.code || '500',
      );
    }
  }
}
