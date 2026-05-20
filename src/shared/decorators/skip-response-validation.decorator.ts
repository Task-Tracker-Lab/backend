import { SetMetadata } from '@nestjs/common';

export const SKIP_RESPONSE_VALIDATION_KEY = 'SKIP_RESPONSE_VALIDATION_KEY';
export const SkipResponseValidation = () => SetMetadata(SKIP_RESPONSE_VALIDATION_KEY, true);
