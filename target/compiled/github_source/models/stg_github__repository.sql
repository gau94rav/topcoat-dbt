with repository as (

    select *
    from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__repository_tmp`

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
    cast(null as boolean) as archived , 
    cast(null as 
    timestamp
) as created_at , 
    cast(null as 
    string
) as default_branch , 
    cast(null as 
    string
) as description , 
    cast(null as boolean) as fork , 
    cast(null as 
    string
) as full_name , 
    cast(null as 
    string
) as homepage , 
    cast(null as 
    int64
) as id , 
    cast(null as 
    string
) as language , 
    cast(null as 
    string
) as name , 
    cast(null as 
    int64
) as owner_id , 
    cast(null as boolean) as private 



    from repository

), fields as (

    select 
      id as repository_id,
      full_name,
      private as is_private

    from macro
)

select *
from fields