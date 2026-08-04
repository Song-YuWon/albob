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
