SELECT
lower(RIGHT(w,length(w)-1)) as handle,
sum(total) as total
FROM `hashpath-demo-data`.`dbt_demo_production`.`tweet_words`
WHERE w LIKE '@%'
GROUP BY 1
ORDER BY 2 DESC