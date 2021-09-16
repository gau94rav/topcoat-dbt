

  create or replace view `hashpath-demo-data`.`dbt_demo_production`.`massachusetts_sightings`
  OPTIONS()
  as select *
from `hashpath-demo-data`.`dbt_demo_production`.`all_sightings`
cross join `hashpath-demo-data`.`dbt_demo_production`.`new_model`
where state='California';

