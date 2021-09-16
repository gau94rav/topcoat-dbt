

  create or replace view `hashpath-demo-data`.`dbt_demo_production`.`mrt_tweet_words`
  OPTIONS()
  as SELECT
  w,
  created_at,
  count(*) as total
FROM `hashpath-demo-data`.`dbt_demo_production`.`stg_unique_public_metrics` r, UNNEST(r.words) as w
WHERE w LIKE '%@%' AND w <> '@tayloramurphy'
GROUP BY 1,2;

