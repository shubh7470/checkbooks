import { z } from 'zod';

export const chequeFormSchema = z.object({
  payeeName: z
    .string()
    .trim()
    .min(2, { message: 'Payee name must be at least 2 characters' })
    .max(80, { message: 'Payee name cannot exceed 80 characters' }),
  amount: z
    .union([z.number(), z.string()])
    .refine((val) => val !== '' && !isNaN(Number(val)), {
      message: 'Please enter a valid amount',
    })
    .transform((val) => Number(val))
    .refine((val) => val > 0, {
      message: 'Amount must be greater than zero',
    })
    .refine((val) => val <= 999999999.99, {
      message: 'Amount exceeds maximum limit (₹99 Crore)',
    }),
  amountInWords: z.string().min(1, { message: 'Amount in words is required' }),
  date: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, {
      message: 'Date must be in DD/MM/YYYY format',
    })
    .refine((dateStr) => {
      const [day, month, year] = dateStr.split('/').map(Number);
      if (month < 1 || month > 12) return false;
      if (year < 2000 || year > 2099) return false;
      const daysInMonth = new Date(year, month, 0).getDate();
      return day >= 1 && day <= daysInMonth;
    }, {
      message: 'Invalid calendar date',
    }),
  isAcPayee: z.boolean(),
  selectedLayoutId: z.string().min(1),
  selectedPrinter: z.string().optional(),
});

export type ChequeFormValidation = z.infer<typeof chequeFormSchema>;
