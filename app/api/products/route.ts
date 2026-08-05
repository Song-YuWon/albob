import { NextResponse } from "next/server";
import { createProductSchema } from "@/lib/validation/registration";
import { createProduct } from "@/lib/db/products";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { getCurrentTesterId } from "@/lib/server/getCurrentTester";
import { API_ERROR_CODE } from "@/lib/constants/codes";
import { MESSAGES } from "@/lib/constants/messages";

export async function POST(request: Request) {
  const testerId = await getCurrentTesterId();
  if (!testerId) {
    return NextResponse.json(
      { code: API_ERROR_CODE.UNAUTHORIZED, message: MESSAGES.auth.loginRequired },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createProductSchema.safeParse(body);

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
  const productId = await createProduct(supabase, { ...parsed.data, createdBy: testerId });

  return NextResponse.json({ productId }, { status: 201 });
}
