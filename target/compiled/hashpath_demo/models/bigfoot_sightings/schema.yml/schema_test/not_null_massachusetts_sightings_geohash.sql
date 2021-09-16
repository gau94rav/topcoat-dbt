
    
    



select count(*) as validation_errors
from `hashpath-demo-data`.`dbt_demo_production`.`massachusetts_sightings`
where geohash is null


