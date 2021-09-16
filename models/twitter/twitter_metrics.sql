SELECT
pu.id,
pu.text,
pu.like_count,
pu.retweet_count,
pr.non_public_metrics_user_profile_clicks, 
pr.organic_metrics_impression_count,
pu.created_at,
pu.url

FROM {{ ref('stg_unique_public_metrics') }} pu

LEFT JOIN {{ ref('stg_unique_private_metrics') }} pr
ON pu.id = pr.id