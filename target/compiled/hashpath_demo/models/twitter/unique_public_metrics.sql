with unique_tweets as 
  (SELECT * FROM (SELECT
  created_at as created_at,
  id,
  text, 
  like_count,
  retweet_count,
  url,
  rank() OVER(PARTITION BY id ORDER BY fetch_date DESC) as rank
  FROM `hashpath-demo-data`.`twitter`.`public_metrics` )
  WHERE rank = 1
  )
SELECT
  id,
  text,
  like_count,
  retweet_count,
  created_at,
  url
FROM unique_tweets
ORDER BY 3 DESC