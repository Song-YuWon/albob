import type { OcrTag } from "@/lib/client/registrationApi";
import type { WizardTag } from "./types";

let tagKeyCounter = 0;

export function nextTagKey(): string {
  tagKeyCounter += 1;
  return `tag-${tagKeyCounter}`;
}

export function toWizardTags(ocrTags: OcrTag[]): WizardTag[] {
  return ocrTags.map((tag) => ({
    key: nextTagKey(),
    rawText: tag.rawText,
    status: tag.status,
    ingredientId: tag.ingredientId,
    ingredientName: tag.ingredientName,
  }));
}
