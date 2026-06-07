import { SetMetadata } from '@nestjs/common';

export const SKIP_ZOD_VALIDATION = 'SKIP_ZOD_VALIDATION';
export const SkipZodValidation = () => SetMetadata(SKIP_ZOD_VALIDATION, true);
