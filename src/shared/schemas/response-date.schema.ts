import { z } from 'zod/v4';

export const zResponseDate = () =>
    z.preprocess((val) => (val instanceof Date ? val.toISOString() : val), z.string().datetime());
