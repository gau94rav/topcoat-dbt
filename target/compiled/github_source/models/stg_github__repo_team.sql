with base as (

    select * 
    from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__repo_team_tmp`

),

fields as (

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
) as permission , 
    cast(null as 
    int64
) as repository_id , 
    cast(null as 
    int64
) as team_id 


        
    from base
    
), final as (
    
    select 
        repository_id,
        team_id
    from fields
)

select * from final