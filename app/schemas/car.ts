import { z } from "zod";

export const CarFormSchema = z.object({
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  price_avg: z.coerce.number().min(0, "Preço deve ser positivo"),
  type: z.string().min(1, "Categoria é obrigatória"),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  
  // Specs
  trunk_liters: z.coerce.number().min(0).default(0),
  wheelbase: z.coerce.number().min(0).default(0),
  ground_clearance: z.coerce.number().min(0).default(0),
  fuel_consumption_city: z.coerce.number().min(0).default(0),
  hp: z.coerce.number().min(0).optional().default(0),
  acceleration: z.coerce.number().min(0).optional().default(0),
  transmission: z.string().default("Automático"),
  fuel_type: z.string().default("Flex"),
});

export type CarFormValues = z.infer<typeof CarFormSchema>;
