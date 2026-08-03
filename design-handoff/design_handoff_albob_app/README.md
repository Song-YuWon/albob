# Handoff: 알밥 (ALBOB) — 반려동물 사료 성분 조회/등록 앱

## Overview
알밥은 반려동물 보호자가 사료의 원재료(성분) 정보를 검색하고, 없는 제품은 사진을 찍어 OCR로 등록하며, 리뷰를 남기는 모바일 앱이다. 핵심 가치는 **성분 정보의 신뢰도**(등록자/수정자 표기, 조회수, 수정 이력)와 **커뮤니티 기반 데이터 축적**(사용자가 직접 등록·수정하는 공유 데이터베이스)이다. 원본 기획서는 `source/알밥_기획서_v1.3.pdf` 참고.

## About the Design Files
`source/` 안의 `.dc.html` 파일은 브라우저에서 바로 열리는 **디자인 레퍼런스(정적 목업)** 이며, 실제 프로덕션 코드가 아니다. 이 리포에 그대로 붙여넣지 말 것. 목표 코드베이스(React Native / Flutter / Swift / Kotlin 등, 기존 프로젝트가 있다면 그 스택)의 기존 컴포넌트·상태관리·네비게이션 패턴을 사용해 아래 명세대로 **재구현**한다. 아직 스택이 없다면 모바일 앱에 적합한 프레임워크(React Native, Flutter 등)를 선택해 구현한다.

- `알밥 앱.dc.html` — 최종 하이파이 목업 (이번 핸드오프의 기준 파일)
- `알밥 와이어프레임.dc.html` — 초기 저해상도 와이어프레임 (구조 참고용, 스타일은 무시)
- `ios-frame.jsx` — 프리뷰용 iOS 기기 베젤 목업 (실제 앱에는 불필요, 목업 렌더링 용도만)
- `support.js` — 목업 런타임 파일 (구현에 사용하지 않음)
- `알밥_기획서_v1.3.pdf` — 원본 기획서

## Fidelity
**High-fidelity.** 색상, 타이포그래피, 여백, 컴포넌트 형태가 최종안이다. 개발자는 목표 코드베이스의 기존 UI 라이브러리/디자인 토큰 체계를 사용해 아래 값들을 픽셀 단위로 맞춰 구현한다.

## Design Tokens

### Colors (light / dark)
| Token | Light | Dark | Usage |
|---|---|---|---|
| `--bg` | `#FBF3E8` | `#1C1712` | 화면 배경 |
| `--surface` | `#FFFFFF` | `#252017` | 카드/입력창 배경 |
| `--surface-2` | `#F3E7D6` | `#2F2A20` | 보조 배경 (칩, 썸네일 placeholder) |
| `--ink` | `#2A2118` | `#F3EAE0` | 본문 텍스트 |
| `--ink-soft` | `#8C7F6C` | `#A99C89` | 보조 텍스트 |
| `--ink-tint` | `#8A7561` | `#FBF6EF` | 로고 하이라이트 전용 |
| `--accent` | `#E2622C` | `#FF7C48` | 주요 CTA, 강조, 별점 |
| `--accent-soft` | `#FBDCC6` | `#4A2E1E` | 매칭된 태그 배경 |
| `--danger` | `#B3452F` | `#E8836A` | 에러 텍스트/아이콘 |
| `--danger-soft` | `#F6DCD3` | `#3D241E` | 에러 아이콘 배경 |
| `--line` | `#E8DCC6` | `#3B3226` | 보더, 구분선, 비활성 dot |

다크모드는 별도 테마가 아니라 위 토큰 전체를 스왑하는 방식(`data-theme="dark"`)이다. 최대 2개 배경색 원칙: `--bg`(전체)와 `--surface`/`--surface-2`(카드류)만 사용.

### Typography
- Display (제목/로고/스크린 헤드라인): **Gowun Batang**, weight 400/700, serif — 감성적 순간(로고, "앗, 아직 없는 사료예요", "등록 완료!" 등)에 사용
- Body (본문/UI 전반): **Pretendard** (`-apple-system, system-ui, sans-serif` 폴백)
- 로고 타이틀: 26px/700 (풀 스크린), 19px/700 (헤더 내), 20px/700 (컴팩트)
- 화면 타이틀(h1급): 18–19px/700, Gowun Batang
- 본문: 12–14px/400, Pretendard
- 캡션/메타: 10–11.5px, `--ink-soft`
- 태그 칩 텍스트: 11.5–12px

### Spacing & Shape
- 기기 프레임 기준 캔버스: 300×650px (실제 구현 시 표준 모바일 뷰포트로 대체)
- 화면 좌우 패딩: 22–24px, 상단 패딩(상태바 감안): 44–48px
- 카드 radius: 14–16px / 태그 칩(pill): 999px / 큰 원형 아이콘 배경: 50%
- 카드 간 gap: 8–16px
- 버튼 padding: 13–16px 수직, radius 12–14px
- Primary 버튼 그림자: `box-shadow: 0 10px 24px -10px var(--accent)` (활성 상태만; 비활성 시 그림자 없음)

### Iconography
Stroke 기반 라인 아이콘만 사용 (SVG, `stroke-width` 2–2.4, `stroke="currentColor"` 또는 토큰색). 이모지 미사용. 로고는 커스텀 SVG (아래 참고).

## Assets
- **로고**: 사료 그릇을 옆에서 본 형태(사다리꼴 + 내부 깊이 표현) 위에 발바닥 무늬 1개. 인라인 SVG로 제작되어 있음 (`알밥 앱.dc.html` 내 반복되는 `<svg viewBox="0 8 40 26">` 블록). 코드로 그대로 이식하거나 벡터 애셋(SVG/PDF)으로 export해서 사용.
- **사진 placeholder**: "사진" / "제품 사진" / "촬영한 사진 미리보기" 텍스트가 있는 `--surface-2` 배경 박스 — 실제 구현에서는 이미지 로더 + placeholder 컴포넌트로 대체.
- 폰트: Google Fonts (Gowun Batang), Pretendard CDN (`pretendard@v1.3.9`) — 목표 앱에 두 폰트 파일을 번들로 포함할 것.

## Screens / Views

### 1. 로그인 (Login)
**Purpose**: 운영자가 발급한 테스터 계정으로 로그인 (회원가입 없음, 비공개 베타).
**Layout**: 세로 flex, center 정렬. 상단 로고(파비콘 SVG 104×68 + "알밥" 타이틀 + "알고 먹이는 밥그릇" 태그라인) → 안내 문구 → ID 입력 → 비밀번호 입력 → 로그인 버튼(accent, 그림자) → 하단 "비공개 베타 · 회원가입 없이 이용" 캡션.
**Components**: 텍스트 입력 2개 (border 1.5px `--line`, radius 14px, padding 16px), Primary 버튼 (accent bg, 흰 텍스트, 700/15px).

### 1-1. 로그인 실패 (Error state)
동일 레이아웃, input border가 `--danger`로 변경, 인풋 사이에 에러 아이콘+문구("아이디 또는 비밀번호가 올바르지 않아요", `--danger` 텍스트 11.5px) 삽입. 버튼 그림자 제거(비활성감 대신 에러 강조).

### 2. 홈 — 검색이 먼저 (Search Home)
**Purpose**: 로그인 직후 진입점. 검색이 핵심 행동이므로 최상단.
**Layout**: 헤더(로고 축소형 + "알밥"/태그라인 + 우측 프로필 원형 아이콘 30×30) → "테스터님, 안녕하세요" → 중앙 정렬 블록(감성 카피 "우리 아이 사료, 성분이 궁금하다면" + 검색바 + 최근 검색 칩) → 하단 고정 "+ 사료 성분표 등록하기" 아웃라인 버튼.
**Components**: 검색바(surface bg, border 1.5px line, radius 18px, 그림자, 돋보기 아이콘+placeholder), 최근 검색 pill 칩(border only).

### 2-1. 세션 만료 (Session expiry)
자동 이동 화면. 로고(20px) + 세션 만료 안내 배지(`--surface-2` bg, 경고 아이콘) + 로그인 폼 재사용. 캡션 "세션 만료 시 자동 이동".

### 2-2. 프로필 · 로그아웃 메뉴 (Account menu)
헤더 우측 프로필 아이콘 탭 시 드롭다운. **Position**: `absolute; top:76px; right:24px`, width 110px, surface bg, border, radius 12px, 그림자. 항목: "계정 정보"(ink), "로그아웃"(danger, 700 weight).

### 3. 검색 결과 — 일치 없음 → 유사후보 → 등록유도 (No-match flow)
**Purpose**: 검색어와 정확히 일치하는 제품이 없을 때, 유사 후보를 먼저 보여준 뒤 등록을 유도.
**Layout**: 검색바(입력값 표시) → "혹시 이런 제품을 찾으셨나요?" → 가로 스크롤 후보 카드 3개(108px 폭, 사진 placeholder 60px + 제품명 + 브랜드) → 구분선 → 빈 상태 아이콘(84px 원, 돋보기+X) + "앗, 아직 없는 사료예요" (Gowun Batang 19px) → 하단 고정 "직접 등록해보세요 →" CTA(accent, 그림자).
**Interaction**: 후보 카드 탭 → 해당 제품 상세로 이동. CTA 탭 → 등록 플로우(화면 5) 진입.

### 3-1. 검색 결과 — 일치 있음 (Match found)
검색바 + "일치하는 사료 N건을 찾았어요" + 세로 리스트 카드(52×52 사진 썸네일 + 제품명 700/13px + 별점·성분 개수 메타 + chevron). 하단 "찾는 제품이 아닌가요? **직접 등록하기**"(inline link, ink 700).

### 4. 제품 상세 (Product Detail)
**Purpose**: 신뢰 가능한 성분 정보 열람, 리뷰 확인, 수정/리뷰 진입점.
**Layout** (스크롤 세로 스택, 하단 고정 액션바):
1. 제품 사진 (88px 높이, surface-2, radius 16px)
2. 타이틀 블록: 제품명(Gowun Batang 18px/700) → 브랜드(700/12.5px) → **신뢰 메타데이터**: "등록: 테스터07 · 최종 수정: 2026.07.28 (테스터42)" (10.5px, ink-soft) → "조회 1,204 · 수정 3회"
3. 성분 섹션: 라벨(uppercase, 11px, letter-spacing 0.04em) + 태그 pill 목록(surface-2 bg, radius 999px) + "+3" 오버플로 표시
4. 리뷰 요약: 별점(★ 4.3, accent) + 리뷰 개수 → 리뷰 2개 미리보기(작성자+별점+본문+"도움돼요 N" 반응 pill) → "리뷰 12개 더보기" 링크
5. 하단 고정 액션바: "수정하기"(outline) + "리뷰 작성"(accent, 그림자) 50/50 flex

**Trust signals (중요, 반드시 유지)**: 등록자명, 최종 수정자명+날짜, 조회수, 수정 횟수 — 공유 데이터의 신뢰도를 보여주는 핵심 요소이므로 데이터 모델에 반드시 포함.

### 4-1. 리뷰 더보기 (All reviews)
**Layout**: 타이틀("리뷰 12개") + 평균 별점/제품명 → 세로 스크롤 리스트(구분선 border-bottom). 각 리뷰: 작성자명 + 별점(★ 문자, letter-spacing 1px) + 본문 + 날짜 + "도움돼요" 카운트 pill.

### 4-2. 리뷰 빈 상태 (Empty reviews)
제품 정보(사진/명/브랜드/태그) 동일 유지 + 리뷰 섹션만 빈 상태로 교체: 56px 원형 별 아이콘 + "아직 리뷰가 없어요" + "첫 리뷰를 남겨보세요" + "리뷰 작성하기" 버튼(컴팩트, accent).

### 면책 문구 (Disclaimer, 4 · 4-2 화면 하단 상시 노출)
**Purpose**: 공유 데이터 기반 서비스임을 인지시키고 법적 리스크를 낮춤. 화면 4(제품 상세)와 4-2(리뷰 빈 상태) 최하단, 액션 버튼 아래에 **항상** 노출.
**Copy**: "이 정보는 사용자들이 함께 등록·수정한 내용으로, 성분의 안전성이 검증된 것은 아니에요. 반려동물 건강에 관한 결정은 수의사와 상의해주세요."
**Style**: 9.5px, `--ink-soft`, line-height 1.5, 중앙 정렬. 눈에 띄지 않되 스크롤 없이 항상 보이는 위치(액션 영역 바로 아래, 화면 최하단).
**Note**: 다른 데이터 노출 화면(3-1 검색결과, 6 수정 등)에도 확대 적용할지는 별도 논의 필요 — 현재는 4, 4-2에만 적용됨.

### 5. 사료 등록 플로우 (Registration — multi-step)
가로 스크롤로 배치된 12개 하위 화면. 상단에 5-dot 진행 인디케이터(현재 단계 = accent, 나머지 = line) 공통.

**①-1 촬영·앞면 (1/2)**: 진행 dot 1번째. 카메라 프리뷰 영역(surface-2, 점선 가이드 프레임 accent) + "제품명이 보이는 봉투 앞면을 찍어주세요" + 56px 원형 셔터 버튼(accent).
**①-2 촬영·뒷면·성분표 (2/2)**: 진행 dot 1번째(같은 단계). 상단에 "앞면 촬영 완료" 썸네일(38px, accent border) + 안내문. 동일 카메라 프리뷰 + 셔터. "사각 프레임 안에 성분표를 맞춰주세요".
**②-processing OCR 처리 중**: dot 2번째. 센터 정렬 스피너(64px, border-top accent) + "성분표를 읽는 중..." + "보통 5~10초 정도 걸려요".
**②-실패 OCR 인식 실패**: 센터 정렬. danger-soft 원(64px)+X 아이콘 + "성분표를 읽지 못했어요" + 안내문 + **"다시 촬영하기"**(outline 버튼) / **"태그 없이 계속하기"**(텍스트 링크, underline) 두 가지 복구 경로.
**③ 태그 확인/편집 — 미해결 있음**: dot 3번째. 안내 배지("아직 확인이 필요한 성분이 1개 있어요", surface-2 bg). **3-state 태그 모델**:
  - **매칭됨(matched)**: accent-soft bg + accent border, 체크 아이콘 라벨
  - **미해결(unresolved)**: surface-2 bg + dashed ink-soft border + accent-soft 아웃라인 글로우(`box-shadow: 0 0 0 3px var(--accent-soft)`), 물음표(?) 접미사 — 탭하면 검색 모달 오픈
  - **검토중(under-review)**: surface bg + dashed accent border, 모래시계(⏳) 접미사 — 사용자가 신규 성분 추가 요청한 상태
  "+ 태그 추가" 버튼(dashed border). **다음 버튼은 미해결 태그가 남아있으면 비활성화**(surface-2 bg, ink-soft 텍스트, 그림자 없음).
**③-search 태그 검색 모달**: 바텀시트(surface bg, radius 22px 상단, drag handle). "어떤 성분인가요?" + 미해결 키워드 **자동 채움**된 검색 입력(accent border 강조) + "자주 쓰는 성분" 추천 칩 + 검색 결과 리스트(매칭 부분 bold, chevron).
**③-request 성분 추가 요청**: 검색 결과 없음 상태. 돋보기+X 아이콘 + "찾는 성분이 없나요?" + 안내문 + **"'{키워드}' 성분 추가 요청하기"** 버튼(outline, accent 텍스트).
**③-resolved 미해결 → 검토중 전환 직후**: 매칭된 태그에 새 항목 추가됨 + 검토중 섹션에 요청한 성분 표시 + 하단 토스트("검토 후 목록에 추가될 예정이에요", ink bg, bg 텍스트, `position:absolute` 하단 고정).
**③-complete 모두 해결됨**: 미해결 섹션 사라짐, "다음" 버튼 활성화(accent bg, 그림자) + "모두 처리됨 · 제출 버튼 활성화" 캡션.
**④ 기본정보 입력**: dot 4번째. 제품명 입력(검색어 프리필, 값 있는 상태로 표시) + 브랜드 입력(placeholder 상태) + 사진 미리보기(64px) + 안내 배지("등록하면 모두가 함께 보는 공유 데이터가 돼요 · 등록 후엔 임의로 지울 수 없고, 잘못된 내용은 수정으로 바로잡아요" — **공유 데이터 정책 문구, 반드시 유지**) + "등록 완료" 버튼.
**⑤ 등록 완료**: dot 5번째. 68px 원형 체크(accent-soft bg + accent border, ✓) + "등록 완료!" + "테스터42님이 첫 등록자예요"(첫 등록자 인정 메시지) + "상세 페이지 보기 →" 버튼.

### 6. 제품 정보 수정 (Edit product)
"공유 데이터입니다 · 등록자가 아니어도 수정할 수 있어요" 배지 + 제품명/브랜드 입력(값 채워진 상태) + 성분 태그(체크 표시된 선택됨 pill + "+ 태그 추가") + "마지막 수정: 2026.07.20 · 테스터07" 메타 + "수정 완료" 버튼.

### 7. 리뷰 작성/수정 (Write review)
타이틀 + 제품명 + 별점 선택 UI(26px 별 5개, letter-spacing 4px, 탭으로 선택) + 코멘트 textarea(placeholder "이 사료 어떠셨나요?") + "리뷰 등록" 버튼. 구분선 아래 "내 리뷰" 섹션: 기존 리뷰 카드 + "수정"/"삭제" 액션(**본인 작성 리뷰만 노출** — "※ 본인이 작성한 리뷰만 수정/삭제할 수 있어요" 캡션).

### 7-1. 폼 검증 에러 (Validation error)
별점 미선택 상태(회색 별, `--line` 색) + 에러 문구("별점을 선택해주세요", danger, 경고 아이콘) + "리뷰 등록" 버튼 opacity 0.5(비활성 시각화).

### 8. 네트워크/서버 에러 (공통, Global error state)
센터 정렬. danger-soft 원(64px) + 경고 아이콘 + "일시적인 오류가 발생했어요" + "네트워크 상태를 확인하고 다시 시도해주세요" + "다시 시도" 버튼(outline). 모든 화면에서 재사용 가능한 공통 에러 컴포넌트로 설계할 것.

## Interactions & Behavior Summary
- **검색 플로우**: 홈 검색바 입력 → 결과 있으면 3-1, 없으면 3(유사 후보 → 빈 상태 → 등록 유도)
- **등록 플로우 네비게이션**: 진행 dot은 5단계 고정(촬영→OCR→태그→기본정보→완료). 뒤로가기 시 이전 단계 데이터 보존.
- **OCR 실패 복구**: "다시 촬영하기"는 ①-2로 회귀, "태그 없이 계속하기"는 태그 없는 상태로 ③ 스킵 후 진입(모든 태그가 비어있는 buildable 상태로 진입, 사용자가 전부 수동 검색으로 채움).
- **태그 상태 전이**: OCR 인식 키워드 → (사전 매칭 성공) matched | (매칭 실패) unresolved → 사용자가 탭 → 검색 모달 → (검색결과 선택) matched로 전환 | (결과 없음, 추가 요청) under-review로 전환. **다음 버튼은 unresolved 태그가 0개일 때만 활성화** — under-review는 제출 허용(정책: 검토 중이어도 등록 자체는 진행 가능).
- **세션 만료**: 백그라운드에서 토큰 만료 감지 시 어느 화면에서든 자동으로 2-1 화면으로 전환.
- **로그아웃**: 프로필 아이콘 탭 → 드롭다운(2-2) → "로그아웃" 탭 → 로그인 화면(1)으로 이동, 로컬 세션 클리어.
- **공통 에러**: 네트워크 요청 실패 시 화면 8 패턴을 오버레이/풀스크린으로 재사용. "다시 시도" 탭 시 직전 요청 재시도.

## State Management
필요한 상태 변수 (제안):
- `session`: `{ token, expiresAt, user }` — 만료 감지용 타이머/인터셉터 필요
- `searchQuery`, `searchResults[]`, `searchStatus`: `'idle' | 'loading' | 'matched' | 'no-match'`
- 등록 플로우 wizard state: `{ step: 1-5, frontPhoto, backPhoto, ocrStatus: 'idle'|'processing'|'success'|'failed', tags: [{ id, label, status: 'matched'|'unresolved'|'under-review' }], productName, brand }`
- `canProceedToNext` = `tags.every(t => t.status !== 'unresolved')`
- 태그 검색 모달: `{ isOpen, targetTagId, query(자동 채움), results[] }`
- 리뷰: `{ rating, comment, myReview, allReviews[], isSubmitting }`
- 폼 검증: 리뷰 등록 시 `rating > 0` 필수, 없으면 에러 표시 + 버튼 비활성(opacity 0.5, 클릭 불가)
- 전역 에러 바운더리/토스트: API 실패 공통 처리

## Screenshots
`screenshots/01-screens.png` – `13-screens.png`는 전체 화면을 위에서 아래로 스크롤하며 순서대로 캡처한 것 (화면 1 로그인 → 화면 8 네트워크 에러 순서). 실제 픽셀 값 확인이 필요하면 이 이미지들과 `source/알밥 앱.dc.html`을 함께 참고할 것.

## Files
- `source/알밥 앱.dc.html` — 전체 화면 하이파이 목업 (기준 파일, 이 문서의 근거)
- `source/알밥 와이어프레임.dc.html` — 초기 구조 와이어프레임
- `source/ios-frame.jsx` — 프리뷰 전용 기기 프레임 (구현 대상 아님)
- `source/support.js` — 목업 런타임 (구현 대상 아님)
- `source/알밥_기획서_v1.3.pdf` — 원본 기획서 (요구사항 원문)
