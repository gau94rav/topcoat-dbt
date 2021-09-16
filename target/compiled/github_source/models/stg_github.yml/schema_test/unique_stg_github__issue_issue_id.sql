
    
    



select count(*) as validation_errors
from (

    select
        issue_id

    from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__issue`
    where issue_id is not null
    group by issue_id
    having count(*) > 1

) validation_errors


