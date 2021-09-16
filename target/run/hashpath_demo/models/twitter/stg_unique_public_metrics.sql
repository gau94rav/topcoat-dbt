

  create or replace view `hashpath-demo-data`.`dbt_demo_production`.`stg_unique_public_metrics`
  OPTIONS()
  as with unique_tweets as 
  (SELECT * FROM (SELECT
  created_at as created_at,
  id,
  text, 
  like_count,
  retweet_count,
  SPLIT(text,' ') as words,
  url,
  rank() OVER(PARTITION BY id ORDER BY fetch_date DESC) as rank
  FROM `hashpath-demo-data`.`twitter`.`public_metrics` )
  WHERE rank = 1
  )
SELECT
  id,
  text,
  words,
  like_count,
  retweet_count,
  created_at,
  url
FROM unique_tweets;

