with issue_merged as (

    select *
    from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__issue_merged_tmp`

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
    int64
) as actor_id , 
    cast(null as 
    string
) as commit_sha , 
    cast(null as 
    int64
) as issue_id , 
    cast(null as 
    timestamp
) as merged_at 



    from issue_merged

), fields as (

    select 
      issue_id,
      merged_at

    from macro
)

select *
from fields