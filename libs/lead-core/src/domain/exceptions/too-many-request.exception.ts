import { CustomException } from './custom.exception';
import { HttpStatus } from '@nestjs/common';

export class TooManyRequestException extends CustomException {
  constructor() {
    super('Too many request exception', HttpStatus.TOO_MANY_REQUESTS + '');
  }
}
