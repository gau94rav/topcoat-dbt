
    
    



select count(*) as validation_errors
from `hashpath-demo-data`.`dbt_demo_production`.`unique_public_metrics`
where id is null


