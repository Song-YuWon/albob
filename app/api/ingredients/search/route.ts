import { NextResponse } from "next/server";
import { z } from "zod";
import { searchIngredients } from "@/lib/db/ingredients";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { API_ERROR_CODE } from "@/lib/constants/codes";
import { MESSAGES } from "@/lib/constants/messages";

const querySchema = z.object({
  q: z
    .string({ error: MESSAGES.ingredient.searchQueryRequired })
    .trim()
    .min(1, MESSAGES.ingredient.searchQueryRequired),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({ q: searchParams.get("q") });

  if (!parsed.success) {
    return NextResponse.json(
      {
        code: API_ERROR_CODE.VALIDATION_ERROR,
        message: parsed.error.issues[0]?.message ?? MESSAGES.upload.invalidRequest,
      },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const results = await searchIngredients(supabase, parsed.data.q);

  return NextResponse.json({ results });
}
