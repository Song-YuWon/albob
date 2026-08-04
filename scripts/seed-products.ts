import { createClient } from "@supabase/supabase-js";
import { DUMMY_PRODUCTS } from "./product-seed-data";

const SEED_TESTER_ID = "tester01";

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

  const { data: existing, error: fetchError } = await supabase.from("products").select("name");
  if (fetchError) throw fetchError;
  const existingNames = new Set((existing ?? []).map((row) => row.name));

  const toInsert = DUMMY_PRODUCTS.filter((product) => !existingNames.has(product.name));
  if (toInsert.length === 0) {
    console.log("추가할 더미 제품이 없습니다 (이미 모두 등록됨).");
    return;
  }

  for (const product of toInsert) {
    const { data: inserted, error: insertError } = await supabase
      .from("products")
      .insert({
        name: product.name,
        brand: product.brand,
        created_by: SEED_TESTER_ID,
        updated_by: SEED_TESTER_ID,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    const { data: ingredientRows, error: ingredientError } = await supabase
      .from("ingredients")
      .select("id, name")
      .in("name", product.ingredients);

    if (ingredientError) throw ingredientError;

    const missing = product.ingredients.filter(
      (name) => !ingredientRows?.some((row) => row.name === name),
    );
    if (missing.length > 0) {
      console.warn(`  경고: "${product.name}"의 성분 중 DB에 없는 항목: ${missing.join(", ")}`);
    }

    if (ingredientRows && ingredientRows.length > 0) {
      const { error: linkError } = await supabase.from("product_ingredients").insert(
        ingredientRows.map((row) => ({ product_id: inserted.id, ingredient_id: row.id })),
      );
      if (linkError) throw linkError;
    }

    console.log(`등록: ${product.brand} · ${product.name} (성분 ${ingredientRows?.length ?? 0}개 연결)`);
  }

  console.log(`총 ${toInsert.length}개 더미 제품을 등록했습니다.`);
}

main().catch((error) => {
  console.error("시드 실패:", error);
  process.exit(1);
});
