select *
from `hashpath-demo-data`.`dbt_demo_production`.`all_sightings`
cross join `hashpath-demo-data`.`dbt_demo_production`.`new_model`
where state='Utah'