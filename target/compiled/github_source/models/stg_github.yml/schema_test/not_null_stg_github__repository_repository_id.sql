
    
    



select count(*) as validation_errors
from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__repository`
where repository_id is null


