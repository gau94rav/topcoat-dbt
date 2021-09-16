SELECT
w as words,
sum(total)
FROM
`hashpath-demo-data`.`dbt_demo_production`.`tweet_words`
WHERE length(w) > 4 AND type <> 'handle'
AND w NOT IN ('about','think','would','tweet','don\'t','there','which','right','should','really','thing','actually','their')
GROUP BY 1
ORDER BY 2 DESC
LIMIT 100