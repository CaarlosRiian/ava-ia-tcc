import { z } from "zod";

export const cadastroInstrutorSchema = z.object({
  especialidade: z.string().min(1, "Obrigatório"),
  bio: z.string().min(10, "Bio muito curta"),
  linkedin: z.string().url().optional().or(z.literal("")),
  portfolio: z.string().url().optional().or(z.literal("")),
  arquivo: z.any().optional(),
});