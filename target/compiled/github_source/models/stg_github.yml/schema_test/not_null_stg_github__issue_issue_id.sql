
    
    



select count(*) as validation_errors
from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__issue`
where issue_id is null


