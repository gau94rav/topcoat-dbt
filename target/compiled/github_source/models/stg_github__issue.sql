with issue as (

    select *
    from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__issue_tmp`

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
) as body , 
    cast(null as 
    timestamp
) as closed_at , 
    cast(null as 
    timestamp
) as created_at , 
    cast(null as 
    int64
) as id , 
    cast(null as boolean) as locked , 
    cast(null as 
    int64
) as milestone_id , 
    cast(null as 
    int64
) as number , 
    cast(null as boolean) as pull_request , 
    cast(null as 
    int64
) as repository_id , 
    cast(null as 
    string
) as state , 
    cast(null as 
    string
) as title , 
    cast(null as 
    timestamp
) as updated_at , 
    cast(null as 
    int64
) as user_id 



    from issue 

), fields as (

    select 
      id as issue_id,
      body,
      closed_at,
      created_at,
      locked as is_locked,
      milestone_id,
      number as issue_number,
      pull_request as is_pull_request,
      repository_id,
      state,
      title,
      updated_at,
      user_id
      
    from macro
)

select *
from fields