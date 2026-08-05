import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentTesterId } from "@/lib/server/getCurrentTester";
import { requestIngredient } from "@/lib/db/ingredients";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { API_ERROR_CODE } from "@/lib/constants/codes";
import { MESSAGES } from "@/lib/constants/messages";

const requestBodySchema = z.object({
  name: z
    .string({ error: MESSAGES.ingredient.nameRequired })
    .trim()
    .min(1, MESSAGES.ingredient.nameRequired)
    .max(50, MESSAGES.ingredient.nameTooLong),
});

export async function POST(request: Request) {
  const testerId = await getCurrentTesterId();
  if (!testerId) {
    return NextResponse.json(
      { code: API_ERROR_CODE.UNAUTHORIZED, message: MESSAGES.auth.loginRequired },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = requestBodySchema.safeParse(body);

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
  const ingredient = await requestIngredient(supabase, {
    name: parsed.data.name,
    requestedBy: testerId,
  });

  return NextResponse.json({ ingredient });
}
