
    
    



select count(*) as validation_errors
from (

    select
        repository_id

    from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__repository`
    where repository_id is not null
    group by repository_id
    having count(*) > 1

) validation_errors


