import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { SESSION_DURATION_SECONDS } from "@/lib/constants/codes";

// middleware(엣지 런타임)와 Route Handler(Node 런타임) 양쪽에서 그대로 재사용할 수 있도록
// jose(웹 표준 crypto 기반)를 사용한다.
function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET 환경변수가 설정되지 않았습니다");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(testerId: string): Promise<string> {
  return new SignJWT({ sub: testerId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

// 서명/만료가 유효하면 테스터 ID를, 아니면 null을 반환 — 호출부는 이 값을 신뢰해서 소유권을 판단한다
export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
