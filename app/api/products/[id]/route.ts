import { NextResponse } from "next/server";
import { updateProductSchema } from "@/lib/validation/registration";
import { updateProduct } from "@/lib/db/products";
import { createSupabaseAdminClient } from "@/lib/server/supabase-admin";
import { getCurrentTesterId } from "@/lib/server/getCurrentTester";
import { API_ERROR_CODE } from "@/lib/constants/codes";
import { MESSAGES } from "@/lib/constants/messages";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const testerId = await getCurrentTesterId();
  if (!testerId) {
    return NextResponse.json(
      { code: API_ERROR_CODE.UNAUTHORIZED, message: MESSAGES.auth.loginRequired },
      { status: 401 },
    );
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateProductSchema.safeParse(body);

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
  await updateProduct(supabase, id, { ...parsed.data, updatedBy: testerId });

  return NextResponse.json({ ok: true });
}
