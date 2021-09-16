
    
    



select count(*) as validation_errors
from (

    select
        pull_request_review_id

    from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__pull_request_review`
    where pull_request_review_id is not null
    group by pull_request_review_id
    having count(*) > 1

) validation_errors


