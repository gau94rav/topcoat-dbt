
    
    



select count(*) as validation_errors
from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__team`
where team_id is null


