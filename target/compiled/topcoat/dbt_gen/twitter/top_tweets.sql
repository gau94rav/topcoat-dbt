SELECT
Tweet,
Likes
FROM
__dbt__CTE__all_tweets
ORDER BY 2 DESC
LIMIT 10