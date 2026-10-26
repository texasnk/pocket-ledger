import { z } from 'zod';

export const transactionFormSchema = z.object({
  description: z.string().min(1, 'validation.descriptionRequired'),
  amount: z.coerce.number().positive('validation.amountPositive'),
  date: z.string().min(1, 'validation.dateRequired'),
  type: z.enum(['INCOME', 'EXPENSE']),
  accountId: z.string().min(1, 'validation.accountRequired'),
  categoryId: z.string().min(1, 'validation.categoryRequired'),
  installments: z.coerce.number().int().min(1).max(120),
  isFixed: z.boolean(),
  fixedDuration: z.coerce.number().int().min(1).max(120)
});

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
