





with validation_errors as (

    select
        issue_id, updated_at
    from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__issue_closed_history`

    group by issue_id, updated_at
    having count(*) > 1

)

select count(*)
from validation_errors


