
    
    



select count(*) as validation_errors
from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__pull_request_review`
where pull_request_review_id is null


