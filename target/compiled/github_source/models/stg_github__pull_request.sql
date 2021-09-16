with pull_request as (

    select *
    from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__pull_request_tmp`

), macro as (
    select
        /*
        The below macro is used to generate the correct SQL for package staging models. It takes a list of columns 
        that are expected/needed (staging_columns from dbt_github_source/models/tmp/) and compares it with columns 
        in the source (source_columns from dbt_github_source/macros/).

        For more information refer to our dbt_fivetran_utils documentation (https://github.com/fivetran/dbt_fivetran_utils.git).
        */
        
    cast(null as 
    timestamp
) as _fivetran_synced , 
    cast(null as 
    string
) as base_label , 
    cast(null as 
    string
) as base_ref , 
    cast(null as 
    int64
) as base_repo_id , 
    cast(null as 
    string
) as base_sha , 
    cast(null as 
    int64
) as base_user_id , 
    cast(null as 
    string
) as head_label , 
    cast(null as 
    string
) as head_ref , 
    cast(null as 
    int64
) as head_repo_id , 
    cast(null as 
    string
) as head_sha , 
    cast(null as 
    int64
) as head_user_id , 
    cast(null as 
    int64
) as id , 
    cast(null as 
    int64
) as issue_id , 
    cast(null as 
    string
) as merge_commit_sha 



    from pull_request

), fields as (

    select 
      id as pull_request_id,
      issue_id,
      head_repo_id,
      head_user_id

    from macro
)

select *
from fields