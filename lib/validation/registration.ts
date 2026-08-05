import { z } from "zod";
import { MESSAGES } from "@/lib/constants/messages";

export const ocrRequestSchema = z.object({
  backPhotoUrl: z.string({ error: MESSAGES.upload.invalidRequest }).url({ error: MESSAGES.upload.invalidRequest }),
});

export type OcrRequestInput = z.infer<typeof ocrRequestSchema>;

export const createProductSchema = z.object({
  name: z
    .string({ error: MESSAGES.product.nameRequired })
    .trim()
    .min(1, MESSAGES.product.nameRequired)
    .max(100, MESSAGES.product.nameTooLong),
  brand: z
    .string({ error: MESSAGES.product.brandRequired })
    .trim()
    .min(1, MESSAGES.product.brandRequired)
    .max(50, MESSAGES.product.brandTooLong),
  frontPhotoUrl: z.string({ error: MESSAGES.upload.invalidRequest }).url({ error: MESSAGES.upload.invalidRequest }),
  backPhotoUrl: z.string({ error: MESSAGES.upload.invalidRequest }).url({ error: MESSAGES.upload.invalidRequest }),
  // 미해결 태그가 없어야 한다는 규칙은 클라이언트 제출 게이트에서 이미 막지만,
  // 정말 태그가 하나도 없는 상태(OCR 완전 실패 + 수동으로도 못 찾음)로 제출하는 것 자체는 허용한다
  ingredientIds: z.array(z.string().uuid()).default([]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
