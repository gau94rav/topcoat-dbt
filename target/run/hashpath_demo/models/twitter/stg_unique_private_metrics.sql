

  create or replace view `hashpath-demo-data`.`dbt_demo_production`.`stg_unique_private_metrics`
  OPTIONS()
  as with unique_tweets as 
  (SELECT * FROM (SELECT
  created_at as created_at,
  id,
  text, 
  non_public_metrics_user_profile_clicks, 
  organic_metrics_impression_count,
  url,
  rank() OVER(PARTITION BY id ORDER BY fetch_date DESC) as rank
  FROM `hashpath-demo-data`.`twitter`.`non_public_organic_metrics` )
  WHERE rank = 1
  )
SELECT
  id,
  text,
  non_public_metrics_user_profile_clicks, 
  organic_metrics_impression_count,
  created_at,
  url
FROM unique_tweets;

