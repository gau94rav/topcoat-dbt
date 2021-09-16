

SELECT
date,
sum(sightings) as sightings
FROM `hashpath-demo-data`.`dbt_demo_production`.`sightings_by_day_by_state`
GROUP BY 1