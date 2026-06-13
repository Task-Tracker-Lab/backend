import { SetMetadata } from '@nestjs/common';

export const SKIP_CONTRACT_HANDLE = 'SKIP_CONTRACT_HANDLE';
export const SkipContractHandle = () => SetMetadata(SKIP_CONTRACT_HANDLE, true);
