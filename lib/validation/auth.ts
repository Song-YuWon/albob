import { z } from "zod";
import { MESSAGES } from "@/lib/constants/messages";

export const loginSchema = z.object({
  id: z.string({ error: MESSAGES.auth.idRequired }).min(1, MESSAGES.auth.idRequired),
  password: z.string({ error: MESSAGES.auth.passwordRequired }).min(1, MESSAGES.auth.passwordRequired),
});

export type LoginInput = z.infer<typeof loginSchema>;
