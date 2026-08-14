import { createClient } from "@supabase/supabase-js";

// anon key는 공개 키다(RLS로 권한을 제한하는 게 원래 용도) — 여기서는 서명된 업로드 URL의
// 토큰이 실제 권한을 쥐고 있으므로, 이 클라이언트는 그 토큰을 사용하는 용도로만 쓴다.
export function createSupabaseBrowserClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
