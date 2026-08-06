import { z } from "zod";
import { MESSAGES } from "@/lib/constants/messages";

export const ocrRequestSchema = z.object({
  backPhotoUrl: z.string({ error: MESSAGES.upload.invalidRequest }).url({ error: MESSAGES.upload.invalidRequest }),
});

export type OcrRequestInput = z.infer<typeof ocrRequestSchema>;

// 등록/수정 둘 다 이름·브랜드·성분 목록은 공통이라 base로 뽑아서 재사용한다
const productCoreSchema = z.object({
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
  // 미해결 태그가 없어야 한다는 규칙은 클라이언트 제출 게이트에서 이미 막지만,
  // 정말 태그가 하나도 없는 상태로 제출하는 것 자체는 허용한다
  ingredientIds: z.array(z.string().uuid()).default([]),
});

export const createProductSchema = productCoreSchema.extend({
  frontPhotoUrl: z.string({ error: MESSAGES.upload.invalidRequest }).url({ error: MESSAGES.upload.invalidRequest }),
  backPhotoUrl: z.string({ error: MESSAGES.upload.invalidRequest }).url({ error: MESSAGES.upload.invalidRequest }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

// 수정은 공유 데이터 원칙(기획서 3.3)에 따라 사진은 다시 찍지 않고 이름·브랜드·성분만 고친다
export const updateProductSchema = productCoreSchema;

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
