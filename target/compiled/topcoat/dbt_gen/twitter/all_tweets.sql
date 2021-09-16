select
text as Tweet,
id as id,
timestamp_trunc(created_at,day) as date,
like_count as Likes,
retweet_count as Retweets
FROM
`hashpath-demo-data`.`dbt_demo_production`.`twitter_metrics`
WHERE 1=1

ORDER BY 2 DESC