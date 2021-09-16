
    
    



select count(*) as validation_errors
from (

    select
        issue_comment_id

    from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__issue_comment`
    where issue_comment_id is not null
    group by issue_comment_id
    having count(*) > 1

) validation_errors


