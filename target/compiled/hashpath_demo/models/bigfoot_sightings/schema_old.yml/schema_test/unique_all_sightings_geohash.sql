
    
    



select count(*) as validation_errors
from (

    select
        geohash

    from `hashpath-demo-data`.`dbt_demo_production`.`all_sightings`
    where geohash is not null
    group by geohash
    having count(*) > 1

) validation_errors


