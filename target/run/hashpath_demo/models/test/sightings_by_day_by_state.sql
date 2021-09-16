

  create or replace table `hashpath-demo-data`.`dbt_demo_production`.`sightings_by_day_by_state`
  
  
  OPTIONS()
  as (
    

SELECT
date,
state,
count(*) as sightings
FROM `hashpath-demo-data.hashpath_dataset.bigfoot_sightings`
GROUP BY 1,2
  );
    