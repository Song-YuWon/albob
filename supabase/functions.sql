-- 검색어와 정확히 일치하는 제품이 없을 때 보여줄 유사 후보 (기획서 v1.6 9.3)
-- pg_trgm 유사도 기준 상위 N개. products.name/brand 트라이그램 인덱스를 그대로 활용한다.
-- Supabase SQL Editor에서 실행한다.

create or replace function search_similar_products(keyword text, match_limit int default 3)
returns table (
  id uuid,
  name text,
  brand text,
  front_photo_url text,
  ingredient_count bigint,
  similarity real
)
language sql
stable
as $$
  select
    p.id,
    p.name,
    p.brand,
    p.front_photo_url,
    count(pi.ingredient_id) as ingredient_count,
    greatest(similarity(p.name, keyword), similarity(p.brand, keyword)) as similarity
  from products p
  left join product_ingredients pi on pi.product_id = p.id
  group by p.id
  having greatest(similarity(p.name, keyword), similarity(p.brand, keyword)) > 0.15
  order by similarity desc
  limit match_limit;
$$;

-- 성분 태그 검색 (기획서 v1.6 9.6) — 부분 일치 + 트라이그램 유사도를 함께 사용해
-- 오타·부분 입력 둘 다 대응한다. approved/pending 상태 구분 없이 후보에 포함한다
-- (pending은 클라이언트에서 "검토중" 배지로 표시).
create or replace function search_ingredients(keyword text, match_limit int default 10)
returns table (
  id uuid,
  name text,
  status text,
  similarity real
)
language sql
stable
as $$
  select
    i.id,
    i.name,
    i.status,
    similarity(i.name, keyword) as similarity
  from ingredients i
  where i.name ilike '%' || keyword || '%' or similarity(i.name, keyword) > 0.1
  order by similarity desc, i.name asc
  limit match_limit;
$$;

-- 제품 상세 조회수 증가 (기획서 v1.6 3.2) — 읽고 쓰는 두 단계로 하면 동시 조회 시 값이
-- 어긋날 수 있어, DB 함수 안에서 원자적으로 처리한다.
create or replace function increment_product_view_count(target_id uuid)
returns void
language sql
as $$
  update products set view_count = view_count + 1 where id = target_id;
$$;
