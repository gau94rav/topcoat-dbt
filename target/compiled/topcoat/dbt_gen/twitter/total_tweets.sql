select
count(*) as Tweets,
sum(Likes) as Likes,
sum(Retweets) as Retweets,
sum(CASE WHEN Tweet LIKE '@%' THEN 1 ELSE 0 END)* 1.0 / count(*) as like_retweet_ratio
FROM
__dbt__CTE__all_tweets