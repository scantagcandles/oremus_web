import { z } from "zod";

export const MassIntentionSchema = z.object({
  churchId: z.string(),
  date: z.date(),
  time: z.string(),
  intention: z.string().min(1).max(500),
  type: z.enum(["individual", "collective"]),
  offerer: z.string(),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  payment: z.object({
    method: z.enum(["card", "transfer", "online"]),
    amount: z.number().positive(),
    currency: z.string().default("PLN"),
  }),
});

export type MassIntention = z.infer<typeof MassIntentionSchema>;

export interface Church {
  id: string;
  name: string;
  address: string;
  diocese: string;
  availableHours: string[];
}

export interface MassBookingResponse {
  success: boolean;
  data?: {
    bookingId: string;
    confirmationCode: string;
    paymentUrl?: string;
  };
  error?: string;
}
