import { NextResponse } from "next/server";
import { ocrRequestSchema } from "@/lib/validation/registration";
import { runOcr } from "@/lib/server/ocr";
import { parseIngredientText } from "@/lib/utils/parseIngredientText";
import { matchIngredientsByExactName } from "@/lib/db/ingredients";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { API_ERROR_CODE, TAG_STATUS } from "@/lib/constants/codes";
import { MESSAGES } from "@/lib/constants/messages";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = ocrRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        code: API_ERROR_CODE.VALIDATION_ERROR,
        message: parsed.error.issues[0]?.message ?? MESSAGES.upload.invalidRequest,
      },
      { status: 400 },
    );
  }

  const ocrResult = await runOcr(parsed.data.backPhotoUrl);
  if (ocrResult.status === "failed") {
    return NextResponse.json({ ocrStatus: "failed", tags: [] });
  }

  const candidateNames = parseIngredientText(ocrResult.rawText);
  const supabase = createSupabaseAdminClient();
  const matchedByName = await matchIngredientsByExactName(supabase, candidateNames);

  const tags = candidateNames.map((rawText) => {
    const matched = matchedByName.get(rawText.toLowerCase());
    if (matched) {
      return {
        rawText,
        status: TAG_STATUS.MATCHED,
        ingredientId: matched.id,
        ingredientName: matched.name,
      };
    }
    return {
      rawText,
      status: TAG_STATUS.UNRESOLVED,
      ingredientId: null as string | null,
      ingredientName: null as string | null,
    };
  });

  return NextResponse.json({ ocrStatus: "success", tags });
}
