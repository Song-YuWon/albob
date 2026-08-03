@AGENTS.md

# 알밥 — 개발 규칙

반려동물 사료 성분 등록·검색 서비스. 전체 기획은 [기획서_v1.6.md](기획서_v1.6.md) 참고, 화면별 상세 디자인 명세는 [design-handoff/design_handoff_albob_app/README.md](design-handoff/design_handoff_albob_app/README.md) 참고. 이 문서는 코드를 작성할 때 지켜야 할 규칙만 담는다.

## 협업 방식

- **애매하거나 결정이 필요한 지점은 진행 전에 반드시 질문한다.** 임의로 가정하고 넘어가지 않는다
- **한 번에 너무 많이 하지 않는다.** 작업을 작은 단계로 쪼개서 한 단계씩 결과를 보여준다
- **각 단계마다 사용자 확인을 받은 뒤에만 다음 단계로 진행한다**
- 새 작업을 시작하기 전엔 전체 작업 순서(단계 목록)를 먼저 제시하고 동의를 구한 뒤 착수한다

## 폴더 구조

Next.js App Router가 강제하는 건 `app/` 안의 라우팅 규칙(`page.tsx`, `layout.tsx`, `route.ts`)뿐이다. 그 외 구조는 아래를 따른다.

```
app/
  (auth)/login/           # 로그인 (베타 게이트)
  (main)/
    page.tsx              # 홈 (검색)
    products/[id]/        # 제품 상세
    products/[id]/edit/   # 제품 정보 수정
    register/             # 성분표 등록 플로우 (다단계)
  api/
    products/              route.ts, [id]/route.ts
    ingredients/            search/route.ts, request/route.ts
    reviews/                route.ts
    auth/login/              route.ts
  middleware.ts            # 세션 쿠키 게이트, 없으면 /login으로

components/                # 여러 화면에서 재사용하는 순수 UI 컴포넌트
  ui/                      # shadcn/ui
  TagChip/, ProductCard/ 등  컴포넌트별 폴더 (Component.tsx + Component.module.css)

lib/
  server/                  # 서버 전용 코드. service role key, OCR 호출 등
  db/                      # Supabase 쿼리를 감싼 함수 모음 — Route Handler는 이것만 호출
  validation/              # zod 스키마 — 클라이언트 폼과 서버 API 양쪽에서 재사용
  constants/
    messages.ts             # 한국어 문자열
    codes.ts                 # 태그 상태(matched/unresolved/requested), 응답 코드, API 필드명 등
  utils/
```

## 코드 규칙

❌ TSX 인라인 스타일(`style={{...}}`) 금지 — Tailwind 유틸리티 클래스 사용. 반복되는 색상/간격 값은 `tailwind.config`의 theme에 등록해서 매직 값 규칙과 통합 (하드코딩 `#e07a00` 대신 `bg-primary` 같은 식)

❌ 한국어 문자열 직접 박기 금지 → `lib/constants/messages.ts`로 관리

❌ 매직 값 직접 사용 금지 → 태그 상태값·응답 코드·API 필드명 모두 `lib/constants/codes.ts` 같은 상수 파일로

❌ 한 파일 200줄 초과 금지 → 넘으면 분리. 단, 시드 데이터·타입 정의 파일처럼 자연히 길어지는 파일은 예외 (로직 파일에 한정)

❌ API 키 코드에 직접 금지 → `.env` + `.gitignore`에 `.env`. Supabase **service role key는 `lib/server/`에만 두고, `server-only` 패키지를 붙여서 클라이언트 컴포넌트가 import하면 빌드 에러가 나게** 한다

❌ `'use client'`는 정말 필요한 말단 컴포넌트에만 — 파일 위에 습관적으로 붙이면 서버 컴포넌트의 이점(번들 크기, 성능)이 사라짐

❌ Route Handler에서 Supabase 쿼리 직접 작성 금지 → `lib/db/`의 함수를 통해서만 접근 (등록/수정/검색 로직 중복 방지, 나중에 Prisma로 바꿀 때도 이 계층만 교체하면 되게)

❌ zod 스키마를 클라이언트/서버에 따로 만들지 않는다 → `lib/validation/`에서 한 번 정의하고 폼 검증과 API 검증 양쪽에서 import

✅ 날짜는 항상 UTC로 저장하고, 화면에 표시할 때만 로컬 시간으로 변환 ("최종 수정일" 노출이 핵심 기능이라 타임존 처리를 여기서 미리 통일)

✅ 주석은 "왜"에 집중 — 6개월 뒤에도 이해 가능하게

✅ 에러 메시지는 한국어 — 사용자가 읽는 것

✅ 확장 용이하게 — MVP 단계이니 후일 업데이트/고도화에 대비

✅ 가능한 규칙은 ESLint 등 도구로 강제 (`no-restricted-syntax`로 한국어 리터럴 검출 등) — 사람이 리뷰 때마다 기억하는 것보다 시간이 지나도 안 흐트러짐

## 아키텍처 핵심 원칙 (기획서 결정사항 요약)

- **베타 접근 제어**: 임시 ID/PW 로그인 → 서명된 세션(httpOnly 쿠키) → 미들웨어가 쿠키 없으면 전체 사이트 차단. 모든 쓰기는 Route Handler 경유, service role key는 서버에만. 세션 만료 시 자동으로 로그인 화면 전환, 헤더 프로필 메뉴에서 로그아웃
- **제품 정보는 공유 데이터**: 로그인한 테스터 누구나 수정 가능(등록자 본인 아니어도 됨). **삭제 기능 없음** — 잘못된 정보는 수정으로 바로잡는다. 수정 시 `updated_at`/`updated_by` 자동 기록 + `product_edit_logs`에 이력 적재
- **신뢰 메타데이터**: 제품 상세에 등록자·최종 수정자(로그인 ID를 표시명으로 그대로 사용)·최종 수정일·조회수·수정 횟수를 노출. 수정 횟수는 `product_edit_logs` 건수를 그대로 쓰고 별도 카운터를 두지 않는다(값이 어긋나지 않게). 조회수는 상세 페이지 조회마다 `products.view_count` 증가
- **리뷰는 개인 콘텐츠**: 작성자 본인만 수정/삭제 가능 (제품과 반대 원칙이니 헷갈리지 않기). 별점 미선택 시 제출 막기
- **성분 태그는 3가지 상태**: 매칭됨(확정) / 미해결(회색, 조치 안 함) / 요청됨(검토중). **미해결이 하나라도 남으면 등록 제출 불가**, 요청됨은 제출을 막지 않음
- **"성분 추가 요청"은 즉시 `ingredients`에 `status: pending` 행을 만들어 제품에 바로 연결** — 운영자 승인을 기다리며 등록이 막히지 않게. pending도 검색에 노출해 중복 요청 방지
- **성분표 사진은 앞면(제품명)·뒷면(성분표) 2장**. OCR은 뒷면 대상, 실패 시 "다시 촬영하기" 또는 "태그 없이 계속하기"로 등록이 막히지 않게
- **검색은 PostgreSQL `pg_trgm`** — 제품 유사 후보 추천과 성분 태그 검색 양쪽에 동일하게 재사용
- **OCR은 PaddleOCR을 Render에 자체 서비스로 배치** — 외부 API 키/쿼터 의존 없음
- **에러 처리는 공통 컴포넌트로**: 네트워크/서버 에러는 화면마다 따로 만들지 않고 재사용 가능한 전역 에러 컴포넌트 하나로 처리

## 디자인 시스템

전체 화면별 상세 명세와 스크린샷은 `design-handoff/design_handoff_albob_app/`(README.md, screenshots/, `알밥 앱.dc.html`)이 기준. 아래는 코드 작성 시 바로 참조할 핵심 값만 발췌.

### 색상 (light — dark는 핸드오프 README의 다크 토큰 표 참고, `data-theme="dark"`로 전체 스왑)

| 토큰 | 값 | 용도 | Tailwind theme 키 제안 |
|---|---|---|---|
| `--bg` | `#FBF3E8` | 화면 배경 | `bg` |
| `--surface` | `#FFFFFF` | 카드/입력창 배경 | `surface` |
| `--surface-2` | `#F3E7D6` | 보조 배경(칩, 사진 placeholder) | `surface-2` |
| `--ink` | `#2A2118` | 본문 텍스트 | `ink` |
| `--ink-soft` | `#8C7F6C` | 보조 텍스트 | `ink-soft` |
| `--accent` | `#E2622C` | CTA·강조·별점 | `primary` |
| `--accent-soft` | `#FBDCC6` | 매칭된 태그 배경 | `primary-soft` |
| `--danger` | `#B3452F` | 에러 텍스트/아이콘 | `danger` |
| `--danger-soft` | `#F6DCD3` | 에러 아이콘 배경 | `danger-soft` |
| `--line` | `#E8DCC6` | 보더, 구분선 | `line` |

이 값들을 하드코딩 hex로 흩뿌리지 말고 `tailwind.config`의 `theme.colors`에 등록해서 클래스명(`bg-primary` 등)으로만 사용 — 매직 값 금지 규칙과 동일한 이유.

### 타이포그래피

- **Gowun Batang**(serif) — 로고, 화면 타이틀, "앗, 아직 없는 사료예요" 같은 감성적 순간
- **Pretendard** — 본문/UI 전반 (폴백: `-apple-system, system-ui, sans-serif`)
- 두 폰트 파일은 CDN이 아니라 프로젝트에 번들로 포함

### 컴포넌트 규칙

- 배경은 최대 2단계만 사용(`bg` 전체 + `surface`/`surface-2` 카드류) — 임의로 세 번째 배경톤 만들지 않기
- 카드 radius 14~16px, 태그 칩은 pill(radius 999px), 큰 원형 아이콘 배경은 50%
- 아이콘은 stroke 기반 라인 아이콘만(SVG, stroke-width 2~2.4), 이모지 사용 안 함
- 태그 칩 3상태 스타일: 매칭됨 = `accent-soft` 배경 + `accent` 보더 / 미해결 = `surface-2` 배경 + 점선 `ink-soft` 보더 + `accent-soft` 아웃라인 글로우 / 요청됨(검토중) = `surface` 배경 + 점선 `accent` 보더
- Primary 버튼은 활성 상태에서만 그림자(`box-shadow: 0 10px 24px -10px var(--accent)`), 비활성 시 그림자 제거
