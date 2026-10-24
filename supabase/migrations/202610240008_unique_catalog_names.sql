-- Keep one catalogue row per product name; the initial seed list contained duplicate entries.
with ranked_products as (
  select id, row_number() over (
    partition by lower(trim(name))
    order by
      case
        when lower(trim(name)) = 'cabbage f1-delta' and image_url like '%32586565%' then 0
        when lower(trim(name)) = 'lucerne-aurora' and image_url like '%32586364%' then 0
        else 1
      end,
      created_at asc,
      id asc
  ) as row_number
  from public.products
)
delete from public.products as product
using ranked_products as ranked
where product.id = ranked.id and ranked.row_number > 1;
