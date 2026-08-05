import { z } from "zod";
import { PRODUCT_PHOTO_SIDE } from "@/lib/constants/codes";
import { MESSAGES } from "@/lib/constants/messages";

export const productPhotoUploadSchema = z.object({
  draftId: z.string({ error: MESSAGES.upload.invalidRequest }).uuid({ error: MESSAGES.upload.invalidRequest }),
  side: z.enum([PRODUCT_PHOTO_SIDE.FRONT, PRODUCT_PHOTO_SIDE.BACK], {
    error: MESSAGES.upload.invalidRequest,
  }),
});

export type ProductPhotoUploadInput = z.infer<typeof productPhotoUploadSchema>;
