export type WizardStep = "photo-front" | "photo-back" | "ocr" | "tags" | "info" | "done";

export type TagStatus = "matched" | "unresolved" | "requested";

export interface WizardTag {
  key: string; // React key/식별용 — ingredientId와 별개로 클라이언트에서만 쓰는 값
  rawText: string;
  status: TagStatus;
  ingredientId: string | null;
  ingredientName: string | null;
}
