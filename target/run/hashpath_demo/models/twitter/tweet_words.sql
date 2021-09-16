

  create or replace view `hashpath-demo-data`.`dbt_demo_production`.`tweet_words`
  OPTIONS()
  as SELECT
  w,
  created_at,
  CASE WHEN w LIKE '%@%' THEN 'handle' ELSE 'word' END as type,
  count(*) as total
FROM `hashpath-demo-data`.`dbt_demo_production`.`stg_unique_public_metrics` r, UNNEST(r.words) as w
GROUP BY 1,2,3;

