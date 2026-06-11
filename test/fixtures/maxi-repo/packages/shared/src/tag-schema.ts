import { z } from 'zod';

export const tagSchema = z.object({
  label: z.string().min(1),
  assetId: z.number().int().positive(),
});
