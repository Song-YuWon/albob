// server-only 가드가 붙은 lib/server/supabase-admin.ts는 Next.js 번들러 안에서만 동작하므로,
// 순수 Node로 실행되는 이 스크립트는 별도로 Supabase 클라이언트를 만든다.
import { createClient } from "@supabase/supabase-js";
import { listIngredientNames, insertApprovedIngredients } from "../lib/db/ingredients";
import { INITIAL_INGREDIENTS } from "./ingredient-seed-data";

function createScriptSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 필요합니다");
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function main() {
  const supabase = createScriptSupabaseClient();

  const uniqueNames = Array.from(new Set(INITIAL_INGREDIENTS));
  if (uniqueNames.length !== INITIAL_INGREDIENTS.length) {
    console.warn(
      `주의: 시드 목록에 중복 항목이 ${INITIAL_INGREDIENTS.length - uniqueNames.length}개 있어 제거했습니다.`,
    );
  }

  const existingNames = new Set(
    (await listIngredientNames(supabase)).map((name) => name.toLowerCase()),
  );
  const newNames = uniqueNames.filter((name) => !existingNames.has(name.toLowerCase()));

  if (newNames.length === 0) {
    console.log("추가할 새 성분이 없습니다 (이미 모두 등록됨).");
    return;
  }

  const inserted = await insertApprovedIngredients(supabase, newNames);
  console.log(`${inserted}개 성분을 새로 등록했습니다. (목록 총 ${uniqueNames.length}개 중)`);
}

main().catch((error) => {
  console.error("시드 실패:", error);
  process.exit(1);
});
