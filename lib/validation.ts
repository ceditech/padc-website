import { z } from "zod";

const optionalText = z.string().trim().max(2000).optional().or(z.literal(""));
const phone = z.string().trim().max(50).optional().or(z.literal(""));

export const newsletterSchema = z.object({
  email: z.string().trim().email().max(320)
});

export const driverInterestSchema = z.object({
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  phone,
  neighborhood: optionalText,
  platforms: optionalText,
  source: optionalText,
  message: optionalText
});

export const partnerInquirySchema = z.object({
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  organization: z.string().trim().min(1).max(180),
  title: optionalText,
  email: z.string().trim().email().max(320),
  phone,
  inquiryType: z.string().trim().min(1).max(180),
  message: z.string().trim().min(1).max(4000)
});

export const contactSchema = z.object({
  firstName: z.string().trim().min(1).max(120),
  lastName: z.string().trim().min(1).max(120),
  organization: optionalText,
  email: z.string().trim().email().max(320),
  phone,
  persona: z.string().trim().min(1).max(180),
  subject: z.string().trim().min(1).max(220),
  message: z.string().trim().min(1).max(4000)
});
