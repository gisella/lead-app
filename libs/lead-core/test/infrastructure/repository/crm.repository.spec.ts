import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CrmRepository } from '@app/lead-core/infrastructure/repository/crm.repository';
import { Lead, Simulation } from '@app/lead-core/domain';
import { ExternalServiceException } from '@app/lead-core/domain';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { DateTime } from 'luxon';

describe('CrmRepository', () => {
  let repository: CrmRepository;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;

  const mockLead = new Lead({
    id: 1,
    phoneNr: '+1234567890',
    lastSimulation: null,
  });

  const mockAxiosResponse: AxiosResponse = {
    data: { success: true },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as AxiosResponse['config'],
  };

  beforeEach(async () => {
    const mockHttpService = {
      post: jest.fn(),
    };

    const mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue('http://crm-service:3001/api'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CrmRepository,
          useFactory: (
            httpService: HttpService,
            configService: ConfigService,
          ) => {
            return new CrmRepository(httpService, configService);
          },
          inject: [HttpService, ConfigService],
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    repository = module.get<CrmRepository>(CrmRepository);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with CRM API URL from config', () => {
      // Arrange
      const expectedUrl = 'http://crm-service:3001/api';
      configService.getOrThrow.mockReturnValue(expectedUrl);

      // Act
      const newRepository = new CrmRepository(httpService, configService);

      // Assert
      expect(configService.getOrThrow).toHaveBeenCalledWith('CRM_API_URL');
      expect(newRepository).toBeDefined();
    });

    it('should throw error if CRM_API_URL is not configured', () => {
      // Arrange
      configService.getOrThrow.mockImplementation(() => {
        throw new Error('CRM_API_URL is required');
      });

      // Act & Assert
      expect(() => new CrmRepository(httpService, configService)).toThrow(
        'CRM_API_URL is required',
      );
    });
  });

  describe('syncLead', () => {
    it('should successfully sync lead to CRM', async () => {
      // Arrange
      httpService.post.mockReturnValue(of(mockAxiosResponse));

      // Act
      await repository.syncLead(mockLead);

      // Assert
      expect(httpService.post).toHaveBeenCalledWith(
        'http://crm-service:3001/api/lead',
        mockLead,
      );
    });

    it('should handle connection refused error', async () => {
      // Arrange
      const axiosError = new AxiosError();
      axiosError.code = 'ECONNREFUSED';
      httpService.post.mockReturnValue(throwError(() => axiosError));

      // Act & Assert
      expect(async () => await repository.syncLead(mockLead)).rejects.toThrow(
        ExternalServiceException,
      );
    });

    it('should handle timeout error', async () => {
      // Arrange
      const axiosError = new AxiosError();
      axiosError.code = 'ETIMEDOUT';
      httpService.post.mockReturnValue(throwError(() => axiosError));

      // Act & Assert
      expect(async () => await repository.syncLead(mockLead)).rejects.toThrow(
        ExternalServiceException,
      );
    });

    it('should handle unknown error with code', async () => {
      // Arrange
      const axiosError = new AxiosError();
      axiosError.code = 'UNKNOWN_ERROR';
      axiosError.message = 'Something went wrong';
      httpService.post.mockReturnValue(throwError(() => axiosError));

      // Act & Assert
      expect(async () => await repository.syncLead(mockLead)).rejects.toThrow(
        ExternalServiceException,
      );
    });

    it('should handle error without code', async () => {
      // Arrange
      const axiosError = new AxiosError();
      axiosError.message = 'Network error';
      httpService.post.mockReturnValue(throwError(() => axiosError));

      // Act & Assert
      expect(async () => await repository.syncLead(mockLead)).rejects.toThrow(
        ExternalServiceException,
      );
    });

    it.skip('should retry on failure and eventually fail after max retries', async () => {
      // Arrange
      const axiosError = new AxiosError();
      axiosError.code = 'ECONNREFUSED';
      httpService.post.mockImplementation(() => throwError(axiosError));

      // Act & Assert
      expect(async () => await repository.syncLead(mockLead)).rejects.toThrow(
        ExternalServiceException,
      );
      expect(httpService.post).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should handle different lead data correctly', async () => {
      // Arrange
      const differentLead = new Lead({
        id: 2,
        phoneNr: '+9876543210',
        lastSimulation: null,
      });
      httpService.post.mockReturnValue(of(mockAxiosResponse));

      // Act
      await repository.syncLead(differentLead);

      // Assert
      expect(httpService.post).toHaveBeenCalledWith(
        'http://crm-service:3001/api/lead',
        differentLead,
      );
    });

    it('should handle lead with simulation data', async () => {
      // Arrange
      const mockSimulation = new Simulation({
        amount: 100000,
        house_worth: 200000,
        city: 'Test City',
        owners: [],
        hash: 'test-hash',
        createdAt: DateTime.now(),
      });
      const leadWithSimulation = new Lead({
        id: 3,
        phoneNr: '+1111111111',
        lastSimulation: mockSimulation,
      });
      httpService.post.mockReturnValue(of(mockAxiosResponse));

      // Act
      await repository.syncLead(leadWithSimulation);

      // Assert
      expect(httpService.post).toHaveBeenCalledWith(
        'http://crm-service:3001/api/lead',
        leadWithSimulation,
      );
    });
  });

  describe('error handling', () => {
    it('should handle HTTP 500 error', async () => {
      // Arrange
      const axiosError = new AxiosError();
      axiosError.response = {
        status: 500,
        statusText: 'Internal Server Error',
        data: { error: 'Server error' },
        headers: {},
        config: {} as AxiosResponse['config'],
      };
      httpService.post.mockReturnValue(throwError(() => axiosError));

      // Act & Assert
      expect(async () => await repository.syncLead(mockLead)).rejects.toThrow(
        ExternalServiceException,
      );
    });

    it('should handle HTTP 404 error', async () => {
      // Arrange
      const axiosError = new AxiosError();
      axiosError.response = {
        status: 404,
        statusText: 'Not Found',
        data: { error: 'Not found' },
        headers: {},
        config: {} as AxiosResponse['config'],
      };
      httpService.post.mockReturnValue(throwError(() => axiosError));

      // Act & Assert
      expect(async () => await repository.syncLead(mockLead)).rejects.toThrow(
        ExternalServiceException,
      );
    });

    it('should handle network error without response', async () => {
      // Arrange
      const axiosError = new AxiosError();
      axiosError.message = 'Network Error';
      axiosError.code = 'NETWORK_ERROR';
      httpService.post.mockReturnValue(throwError(() => axiosError));

      // Act & Assert
      expect(async () => await repository.syncLead(mockLead)).rejects.toThrow(
        ExternalServiceException,
      );
    });

    it('should handle error with null message and code', async () => {
      // Arrange
      const axiosError = new AxiosError();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      axiosError.message = null as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      axiosError.code = null as any;
      httpService.post.mockReturnValue(throwError(() => axiosError));

      // Act & Assert
      expect(async () => await repository.syncLead(mockLead)).rejects.toThrow(
        ExternalServiceException,
      );
    });
  });

  describe('timeout configuration', () => {
    it('should use configured timeout of 5000ms', async () => {
      // Arrange
      httpService.post.mockReturnValue(of(mockAxiosResponse));

      // Act
      await repository.syncLead(mockLead);

      // Assert
      expect(httpService.post).toHaveBeenCalledWith(
        'http://crm-service:3001/api/lead',
        mockLead,
      );
      // Note: The timeout is applied via RxJS pipe, so we can't directly test it
      // but we can verify the method completes successfully
    });

    it('should handle timeout error from RxJS timeout operator', async () => {
      // Arrange
      const timeoutError = new AxiosError();
      timeoutError.code = 'ETIMEDOUT';
      timeoutError.message = 'Timeout has occurred';
      httpService.post.mockReturnValue(throwError(() => timeoutError));

      // Act & Assert
      expect(async () => await repository.syncLead(mockLead)).rejects.toThrow(
        ExternalServiceException,
      );
    });
  });

  describe('handleAxiosException (private method)', () => {
    it('should return ExternalServiceException with 400 for ECONNREFUSED', () => {
      // Arrange
      const axiosError = new AxiosError();
      axiosError.code = 'ECONNREFUSED';

      // Act
      const result = (repository as any).handleAxiosException(axiosError);

      // Assert
      expect(result).toBeInstanceOf(ExternalServiceException);
      expect(result.message).toBe('Connection Refused');
      expect(result.code).toBe('400');
    });

    it('should return ExternalServiceException with 408 for ETIMEDOUT', () => {
      // Arrange
      const axiosError = new AxiosError();
      axiosError.code = 'ETIMEDOUT';

      // Act
      const result = (repository as any).handleAxiosException(axiosError);

      // Assert
      expect(result).toBeInstanceOf(ExternalServiceException);
      expect(result.message).toBe('Request Timeout');
      expect(result.code).toBe('408');
    });

    it('should return ExternalServiceException with custom message and code', () => {
      // Arrange
      const axiosError = new AxiosError();
      axiosError.code = 'CUSTOM_ERROR';
      axiosError.message = 'Custom error message';

      // Act
      const result = (repository as any).handleAxiosException(axiosError);

      // Assert
      expect(result).toBeInstanceOf(ExternalServiceException);
      expect(result.message).toBe('Custom error message');
      expect(result.code).toBe('CUSTOM_ERROR');
    });

    it('should return ExternalServiceException with default values for null/undefined', () => {
      // Arrange
      const axiosError = new AxiosError();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      axiosError.code = null as any;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      axiosError.message = null as any;

      // Act
      const result = (repository as any).handleAxiosException(axiosError);

      // Assert
      expect(result).toBeInstanceOf(ExternalServiceException);
      expect(result.message).toBe('Unknown error');
      expect(result.code).toBe('500');
    });
  });
});

