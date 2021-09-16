
    
    



select count(*) as validation_errors
from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__issue_comment`
where issue_comment_id is null


