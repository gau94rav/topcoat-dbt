

  create or replace table `hashpath-demo-data`.`dbt_demo_production`.`all_sightings`
  
  
  OPTIONS()
  as (
    

SELECT s.* FROM `hashpath-demo-data`.`hashpath_dataset`.`bigfoot_sightings` s
-- `hashpath-demo-data.hashpath_dataset.bigfoot_sightings` 
--cross join `hashpath-demo-data`.`dbt_demo_production`.`new_model`
  );
    