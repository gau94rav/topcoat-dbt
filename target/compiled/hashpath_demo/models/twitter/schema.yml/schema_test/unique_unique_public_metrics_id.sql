
    
    



select count(*) as validation_errors
from (

    select
        id

    from `hashpath-demo-data`.`dbt_demo_production`.`unique_public_metrics`
    where id is not null
    group by id
    having count(*) > 1

) validation_errors


