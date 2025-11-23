import { z } from 'zod'

export const ProfileUpdateSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  complement: z.string().optional().nullable(),
  number: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
})

export type ProfileUpdateFormData = z.infer<typeof ProfileUpdateSchema>

