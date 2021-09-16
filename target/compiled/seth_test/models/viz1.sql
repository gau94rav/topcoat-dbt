

SELECT
DATE_TRUNC(date,year),
count(*)
FROM `hashpath-demo-data`.`dbt_jrosen`.`all_sightings`
WHERE date IS NOT NULL
AND date > '1960-01-01'
GROUP BY 1
ORDER BY 1 ASC