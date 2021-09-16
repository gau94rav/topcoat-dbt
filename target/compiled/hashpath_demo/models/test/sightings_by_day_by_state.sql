

SELECT
date,
state,
count(*) as sightings
FROM `hashpath-demo-data.hashpath_dataset.bigfoot_sightings`
GROUP BY 1,2