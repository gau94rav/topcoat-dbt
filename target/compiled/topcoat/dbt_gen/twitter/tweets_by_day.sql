select
timestamp_trunc(date,day) as date,
sum(Likes) as like_count,
count(*) as total_tweets
FROM
__dbt__CTE__all_tweets
GROUP BY 1
ORDER BY 1 ASC