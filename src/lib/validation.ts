import { z } from "zod";

const sanitizeString = z.string().trim();

export const ContactSchema = z.object({
  name: sanitizeString.min(1, "Name is required").max(200),
  phone: sanitizeString.min(1, "Phone is required").max(50),
  email: sanitizeString.email("Email must be a valid email address").nullable().or(z.literal("")).optional(),
  company: sanitizeString.max(200).nullable().or(z.literal("")).optional(),
  notes: sanitizeString.max(5000).nullable().or(z.literal("")).optional(),
  tagIds: z.array(z.number().int().positive()).max(50).optional(),
});

export const TagSchema = z.object({
  name: sanitizeString.min(1, "Name is required").max(50),
  color: sanitizeString
    .regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/, "Color must be a valid hex value")
    .default("#6366f1"),
});

export const InteractionSchema = z.object({
  content: sanitizeString.min(1, "Content is required").max(5000),
  type: z.enum(["note", "call", "meeting", "whatsapp"]).default("note"),
});

export type ContactInput = z.infer<typeof ContactSchema>;
export type TagInput = z.infer<typeof TagSchema>;
export type InteractionInput = z.infer<typeof InteractionSchema>;
