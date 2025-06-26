import { CustomException } from '@app/lead-core/domain/exceptions/custom.exception';

export class ExternalServiceException extends CustomException {
  constructor(message: string, code: string) {
    super(message, code);
  }
}
