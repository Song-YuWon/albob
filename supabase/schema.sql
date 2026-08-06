-- 알밥 MVP 초기 스키마 (기획서 v1.6 3.5 데이터 모델 기준)
-- Supabase SQL Editor에서 그대로 실행한다.

create extension if not exists pg_trgm;
create extension if not exists "pgcrypto"; -- gen_random_uuid() 사용

-- 제품 (공유 데이터 — 삭제 없음, 위키형 공동 편집)
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  front_photo_url text,
  back_photo_url text,
  view_count integer not null default 0,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_by text not null,
  updated_at timestamptz not null default now()
);

create index idx_products_name_trgm on products using gin (name gin_trgm_ops);
create index idx_products_brand_trgm on products using gin (brand gin_trgm_ops);

-- 성분 마스터 (approved: 운영자 사전 등록 / pending: 사용자 추가 요청)
create table ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'approved' check (status in ('approved', 'pending')),
  requested_by text,
  created_at timestamptz not null default now()
);

create unique index idx_ingredients_name_unique on ingredients (lower(name));
create index idx_ingredients_name_trgm on ingredients using gin (name gin_trgm_ops);

-- 제품 ↔ 성분 다대다 연결
create table product_ingredients (
  product_id uuid not null references products(id) on delete cascade,
  ingredient_id uuid not null references ingredients(id) on delete cascade,
  primary key (product_id, ingredient_id)
);

create index idx_product_ingredients_ingredient_id on product_ingredients(ingredient_id);

-- 제품 변경 이력 (수정 횟수 표시의 근거 데이터)
create table product_edit_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  editor text not null,
  edited_at timestamptz not null default now(),
  summary text
);

create index idx_product_edit_logs_product_id on product_edit_logs(product_id);

-- 리뷰 (개인 콘텐츠 — 작성자 본인만 수정/삭제, 한 사람당 제품 하나에 리뷰 하나)
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create index idx_reviews_product_id on reviews(product_id);

-- RLS 활성화 + 정책 없음 = anon/authenticated 키로는 아무 것도 접근 불가.
-- 모든 접근은 서버(service_role key, RLS 우회)를 통해서만 이뤄진다는 아키텍처 결정(기획서 4번)의 안전장치.
alter table products enable row level security;
alter table ingredients enable row level security;
alter table product_ingredients enable row level security;
alter table product_edit_logs enable row level security;
alter table reviews enable row level security;
