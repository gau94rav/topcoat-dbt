with github_user as (

    select *
    from `hashpath-demo-data`.`dbt_jrosen`.`stg_github__user_tmp`

), macro as (
    select
        /*
        The below macro is used to generate the correct SQL for package staging models. It takes a list of columns 
        that are expected/needed (staging_columns from dbt_github_source/models/tmp/) and compares it with columns 
        in the source (source_columns from dbt_github_source/macros/).

        For more information refer to our dbt_fivetran_utils documentation (https://github.com/fivetran/dbt_fivetran_utils.git).
        */
            
    cast(null as 
    string
) as company , 
    cast(null as 
    int64
) as id , 
    cast(null as 
    string
) as login , 
    cast(null as 
    string
) as name 


        
        
    from github_user

), fields as (

    select
      id as user_id,
      login as login_name,
      name,
      company

    from macro
)

select *
from fields