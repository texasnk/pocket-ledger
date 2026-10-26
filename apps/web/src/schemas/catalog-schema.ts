import { z } from 'zod';

export const categoryCreationSchema = z.object({
  name: z.string().min(1, 'validation.nameRequired'),
  type: z.enum(['INCOME', 'EXPENSE']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/)
});

export const catalogFormSchema = categoryCreationSchema.extend({
  initialBalance: z.coerce.number().finite('validation.initialBalanceRequired')
});

export type CategoryCreationValues = z.infer<typeof categoryCreationSchema>;
export type CatalogFormValues = z.infer<typeof catalogFormSchema>;
