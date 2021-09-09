import Vue from 'vue'

// initial state
const state = {
  layer: "New Layer",
  cache_key: null,
  active: "layerconfig",
  mode: "pipeline",
  embed_type: null,
  embed_settings: {},
  embed_url: null,
  change_key: 1,
  normal_layers: [],
  types_layers: [],
  shared_layers: [],
  normal_layers_selected: [],
  types_layers_selected: null,
  shared_layers_selected: [],
  queries: [],
  pipeline: [],
  mappings: [],
  height: null,
  visualization: null,
  mapped_figure: null,
  config: null,
  base_config: [],
  type: "",
  mapping_status: "gray",
  mapping_error: null,
  custom_visualization: "",
  custom_vis_error: null,
  embed_types: [
    {
      "name" : "looker-embed",
      "title": "Looker",
      "properties" : [ "dashboard_url", "dashboard_theme", "hide_header", "hide_footer"],
      "property_names" : [ "Dashboard URL", "Dashboard theme", "Hide header", "Hide footer"]
    },
    {
      "name" : "chartio-embed",
      "title" : "Chartio",
      "properties" : [ "dashboard_id"],
      "property_names" : [ "Dashboard ID" ]
    },
    {
      "name" : "periscope-embed",
      "title": "Periscope",
      "properties" : [ "dashboard_id"],
      "property_names" : [ "Dashboard ID" ]
    },
    {
      "name" : "metabase-embed",
      "title" : "Metabase",
      "properties" : [ "dashboard_id"],
      "property_names" : [ "Dashboard ID" ]
    },
    {
      "name" : "kibana-embed",
      "title" : "Kibana",
      "properties" : [ "dashboard_id"],
      "property_names" : [ "Dashboard ID" ]
    }
  ],
  transform_options: [
    {
      "name": "operation",
      "label" : "Operation",
      "type" : "select",
      "options" : [ "SQL", "divide", "multiply", "convertPercent", "format", "convertFloatToDollars", "convertUnixTime", "sum", "groupBy", 
        "pivot", "renameColumn", "normalize", "generateDiscreteIntegers", "mapIso2toIso3", "prepareNodesAndEdges", "custom" ],
      "restrict" : []
    },
    {
      "name": "query_name",
      "label" : "Query Name",
      "type" : "string",
      "restrict" : [ "sql_transform" ]
    },
    {
      "name": "output_column_name",
      "label" : "Output Column Name",
      "type" : "string",
      "restrict" : [ "divide", "multiply", "convertPercent", "format", "convertFloatToDollars", "convertUnixTime", 
        "generateDiscreteIntegers", "mapIso2toIso3", "normalize" ]
    },
    {
      "name": "input_column_name",
      "label" : "Input Column",
      "type" : "select_column",
      "restrict" : [ "divide", "multiply", "convertPercent", "convertFloatToDollars", "convertUnixTime", "generateDiscreteIntegers",
        "mapIso2toIso3" ]
    },
    {
      "name": "divisor",
      "label" : "Divisor",
      "type" : "number",
      "restrict" : [ "divide" ]
    },
    {
      "name": "multiplier",
      "label" : "Multiplier",
      "type" : "number",
      "restrict" : [ "multiply" ]
    },
    {
      "name": "format",
      "label" : "Format",
      "type" : "string",
      "restrict" : [ "format" ]
    },
    {
      "name": "aggregate_function",
      "label" : "Aggregate Function",
      "type" : "select",
      "options" : [ "concat", "average", "min", "max", "sum", "count"],
      "restrict" : [ "groupBy"]
    },
    {
      "name": "by_list",
      "label" : "Group by Columns",
      "type" : "select_column_list",
      "restrict" : [ "groupBy"]
    },
    {
      "name": "concat_separator",
      "label" : "Concat Separator",
      "type" : "string",
      "restrict" : [ "groupBy"]
    },
    {
      "name": "concat_column",
      "label" : "Concat Column",
      "type" : "select_column",
      "restrict" : [ "groupBy"]
    },
    {
      "name": "index",
      "label" : "Index Column",
      "type" : "select_column",
      "restrict" : [ "pivot"]
    },
    {
      "name": "old_column_name",
      "label" : "Old Column Name",
      "type" : "select_column",
      "restrict" : [ "renameColumn"]
    },
    {
      "name": "new_column_name",
      "label" : "New Column Name",
      "type" : "string",
      "restrict" : [ "renameColumn"]
    },
    {
      "name": "pivot_column",
      "label" : "Pivot Column",
      "type" : "select_column",
      "restrict" : [ "pivot"]
    },
    {
      "name": "value_column",
      "label" : "Value Column",
      "type" : "select_column",
      "restrict" : [ "pivot"]
    },
    {
      "name": "normalize_column_name",
      "label" : "Normalize Column",
      "type" : "select_column",
      "restrict" : [ "normalize"]
    },
    {
      "name": "min_val",
      "label" : "Minimum Value",
      "type" : "number",
      "restrict" : [ "normalize"]
    },
    {
      "name": "source_column",
      "label" : "Source Column",
      "type" : "select_column",
      "restrict" : [ "prepareNodesAndEdges"]
    },
    {
      "name": "target_column",
      "label" : "Target Column",
      "type" : "select_column",
      "restrict" : [ "prepareNodesAndEdges"]
    },
    {
      "name": "node_key_columnname",
      "label" : "Node Key Column Name",
      "type" : "select_column",
      "restrict" : [ "prepareNodesAndEdges"]
    },
    {
      "name": "function_name",
      "label" : "Function Name",
      "type" : "string",
      "restrict" : [ "custom"]
    },
  ],
  filters : [],
  attributes : []
}

// getters
const getters = {
}

// mutations
const mutations = {
  setActive (state, active) {
    for (var i=0; i<state.pipeline.length; i++) {
      state.pipeline[i].local.popup_visible = false;
    }
    state.active = active;
  },
  setActiveStep (state, index) {
    for (var i=0; i<state.pipeline.length; i++) {
      state.pipeline[i].local.popup_visible = false;
    }
    for (var i=0; i<state.pipeline.length; i++) {
      state.pipeline[i].local.active = false;
    }
    state.active = "pipeline";
    state.pipeline[index].local.active = true;
  },
  setLayer (state, layer) {
    state.layer = layer;
  },
  setType (state, type) {
    state.type = type;
  },
  setEmbedType (state, type) {
    state.embed_settings = {};
    state.embed_type = type;
    state.embed_url = null;
  },
  setMode (state, mode) {
    state.mode = mode;
    state.normal_layers_selected = [];
    state.types_layers_selected = null;
    state.shared_layers_selected = [];
    state.queries = [];
    state.pipeline = [];
    state.filters = [];
    state.mappings = [];
    state.height = null;
    state.mapped_figure = null;
    state.visualization = null;
    state.mapping_status = "gray";
    state.mapping_error = null;
    state.config = {};
    state.custom_visualization = "";
    state.embed_settings = {};
    state.embed_url = null;
    state.embed_type = null;
  },
  setCacheKey (state, key) {
    state.cache_key = key;
  },
  handleChangeDepends(state, combinedLayer) {

    var pipeline = [];
    var mappings = [];

    var old_queries = state.queries;
    state.queries = combinedLayer.queries;

    for (var i=0; i<old_queries.length; i++) {
      if (old_queries.layer == null) {
        state.queries.push(old_queries[i]);
      }
    }

    state.base_config = [];

    if (combinedLayer.config.type) state.type = combinedLayer.config.type;
    else state.type = ""

    var old_pipeline = state.pipeline;

    for (var i=0; i<combinedLayer.pipeline.steps.length; i++) {
      var step = combinedLayer.pipeline.steps[i];
      if (!step.shared) step.shared = false;
      step.local = {}
      step.local.status = "gray";
      step.local.error = null;
      step.local.results_expanded = false;
      step.local.popup_visible = false;
      step.local.delete_visible = false;
      step.local.editable_props = false;
      if (i==0) step.local.active = true;
      else step.local.active = false;
      step.local.results = [];
      if (state.layer == step.layer) {
        step.layer = null;
      }
      pipeline.push(step);
    }

    for (var i=0; i<old_pipeline.length; i++) {
      if (old_pipeline[i].layer == null) {
        pipeline.push(old_pipeline[i]);
      } else if (combinedLayer.pipeline.steps[i] && old_pipeline[i].query_name == combinedLayer.pipeline.steps[i].query_name) {
        pipeline[i] = old_pipeline[i];
      }
    }

    state.pipeline = pipeline;

    state.mappings.length = 0;

    var last_df = null;
      for (var k=0; k<state.pipeline.length; k++) {
        if (state.pipeline[k].query_name) last_df = state.pipeline[k].query_name;
        else if (state.pipeline[k].view) last_df = state.pipeline[k].view;
    }
    
    for (var i=0; i<combinedLayer.mappings.attributes.length; i++) {
      var mapping = combinedLayer.mappings.attributes[i];
      mapping.column = null;
      mapping.columns = [];
      mapping.literal_val = "";
      mapping.literals = [];
      mapping.format = null;
      mapping.layer = null;
      mapping.geometry_or_point = null;
      mapping.geometry_column_name = null;
      mapping.point_lat_column_name = null;
      mapping.point_lon_column_name = null;
      mapping.property_column_name_list = null;
      if (!mapping.dataframe) mapping.dataframe = last_df;
      state.mappings.push(mapping);
    }
    state.mapping_attributes = combinedLayer.mappings.attributes;

    // Read in rules that come from dependent layers, doesn't change current layer rules
    for (var i=0; i<combinedLayer.mappings.rules.length; i++) {
      var rule = combinedLayer.mappings.rules[i];
      if (rule.attribute) {
        for (var j=0; j<mappings.length; j++) {
            state.mappings[j].layer = rule.layer;
            if (rule.column_name) state.mappings[j].column = rule.column_name;
            if (rule.column_name && !rule.dataframe) state.mappings[j].dataframe = last_df;
            if (rule.value) state.mappings[j].literal_val = rule.value;
            if (rule.format) state.mappings[j].format = rule.format;
            if (rule.geometry_column_name) {
              state.mappings[j].geometry_column_name = rule.geometry_column_name;
              state.mappings[j].geometry_or_point = "geometry";
            }
            if (rule.point_lat_column_name) {
              state.mappings[j].point_lat_column_name = rule.point_lat_column_name;
              state.mappings[j].geometry_or_point = "points";
            }
            if (rule.point_lon_column_name) {
              state.mappings[j].point_lon_column_name = rule.point_lon_column_name;
              state.mappings[j].geometry_or_point = "points";
            }
            if (rule.property_column_name_list) {
              state.mappings[j].property_column_name_list = rule.property_column_name_list;
            }
        }
      }
    }
    /*
    state.change_key = state.change_key + 1;
    state.visualization = null;
    state.config = {};
    */
  },
  storeLayer (state, payload) {

    //console.log("COMBINED");
    //console.log(payload.combinedLayer);

    var pipeline = [];
    var mappings = [];
    state.active = "layerconfig";
    state.layer = payload.layerName;
    state.queries = payload.combinedLayer.queries;
    state.base_config = [];
  
    if (payload.combinedLayer.config.height) state.height = payload.combinedLayer.config.height;

    for (var config_item in payload.combinedLayer.config_layer) {
      if (payload.combinedLayer.config_layer[config_item] != state.layer) state.base_config.push(config_item)
    }

    if (payload.combinedLayer.config.embed_settings) {
      state.mode = 'embed';
      state.embed_settings = payload.combinedLayer.config.embed_settings;
      state.embed_type = payload.combinedLayer.config.type;
      state.embed_url = null;
      state.normal_layers_selected = [];
      state.types_layers_selected = null;
      state.shared_layers_selected = [];
      state.queries = [];
      state.pipeline = [];
      state.mappings = [];
      state.mapped_figure = null;
      state.change_key = state.change_key + 1;
      state.visualization = null;
      state.mapping_status = "gray";
      state.mapping_error = null;
      state.config = {};
      state.custom_visualization = "";
    } else {
      state.mode = 'pipeline';
      state.embed_settings = {};
      state.embed_url = null;
    }

    if (state.mode == 'pipeline') {
      if (payload.combinedLayer.config.custom_visualization) state.custom_visualization = payload.combinedLayer.config.custom_visualization;
      else state.custom_visualization = null;

      if (payload.combinedLayer.config.type) state.type = payload.combinedLayer.config.type;
      else state.type = ""

      state.types_layers_selected = null;
      state.shared_layers_selected.length = 0;

      for (var i=0; i<payload.combinedLayer.config.depends_on.length;i++) {
        for (var j=0; j<state.types_layers[0].layers.length;j++) {
          if (payload.combinedLayer.config.depends_on[i] == state.types_layers[0].layers[j]) {
            state.types_layers_selected = state.types_layers[0].layers[j];
          }
        }
        if (state.shared_layers.length) {
          for (var j=0; j<state.shared_layers[0].layers.length;j++) {
            if (payload.combinedLayer.config.depends_on[i] == state.shared_layers[0].layers[j]) {
              state.shared_layers_selected.push(state.shared_layers[0].layers[j]);
            }
          }
        }
      }

      for (var i=0; i<payload.combinedLayer.pipeline.steps.length; i++) {
        var step = payload.combinedLayer.pipeline.steps[i];
        if (!step.shared) step.shared = false;
        step.local = {}
        step.local.status = "gray";
        step.local.error = null;
        step.local.results_expanded = false;
        step.local.popup_visible = false;
        step.local.delete_visible = false;
        step.local.editable_props = false;
        if (i==0) step.local.active = true;
        else step.local.active = false;
        step.local.results = [];
        if (state.layer == step.layer) {
          step.layer = null;
        }
        pipeline.push(step);
      }
      state.pipeline = pipeline;
      state.config = payload.combinedLayer.config;
    }

    state.filters = [];
    if (payload.combinedLayer.config.filters && payload.combinedLayer.config.filters.output) {
      for (var j=0; j<payload.combinedLayer.config.filters.output.length; j++) {
        var filter = payload.combinedLayer.config.filters.output[j];
        var filter = {
          name : payload.combinedLayer.config.filters.output[j].name,
          urlparam : payload.combinedLayer.config.filters.output[j].urlparam,
          layer: payload.combinedLayer.config.filters.output[j].layer,
          inputoutput: "output",
          value: "",
          edit: false
        }
        if (state.layer == filter.layer) {
          filter.layer = null;
        }
        state.filters.push(filter);
      }
      for (var j=0; j<payload.combinedLayer.config.filters.input.length; j++) {
        var filter = {
          name : payload.combinedLayer.config.filters.input[j].name,
          urlparam : payload.combinedLayer.config.filters.input[j].urlparam,
          layer: payload.combinedLayer.config.filters.input[j].layer,
          inputoutput: "input",
          value: "",
          edit: false
        }
        if (state.layer == filter.layer) {
          filter.layer = null;
        }
        state.filters.push(filter);
      }
    }

    if (state.mode == 'pipeline') {
      var last_df = null;
        for (var k=0; k<state.pipeline.length; k++) {
          if (state.pipeline[k].query_name) last_df = state.pipeline[k].query_name;
          else if (state.pipeline[k].view) last_df = state.pipeline[k].view;
      }

      for (var i=0; i<payload.combinedLayer.mappings.attributes.length; i++) {
        var mapping = payload.combinedLayer.mappings.attributes[i];
        mapping.column = null;
        mapping.columns = [];
        mapping.literal_val = "";
        mapping.literals = [];
        mapping.format = null;
        mapping.geometry_or_point = null;
        mapping.geometry_column_name = null;
        mapping.point_lat_column_name = null;
        mapping.point_lon_column_name = null;
        mapping.property_column_name_list = null;
        if (!mapping.dataframe) mapping.dataframe = last_df;
        mappings.push(mapping);
      }
      state.mapping_attributes = payload.combinedLayer.mappings.attributes;
      state.mappings = mappings;
    
      for (var i=0; i<payload.combinedLayer.mappings.rules.length; i++) {
        var rule = payload.combinedLayer.mappings.rules[i];
        if (rule.attribute) {
          for (var j=0; j<state.mappings.length; j++) {
            if (rule.attribute == state.mappings[j].name) {
              if (state.layer == rule.layer) {
                state.mappings[j].layer = null;
              } else {
                state.mappings[j].layer = rule.layer;
              }
              if (rule.column_name) state.mappings[j].column = rule.column_name;
              if (rule.column_name && !rule.dataframe) state.mappings[j].dataframe = last_df;
              if (rule.column_name && rule.dataframe) state.mappings[j].dataframe = rule.dataframe;
              if (rule.value) state.mappings[j].literal_val = rule.value;
              if (rule.format) state.mappings[j].format = rule.format;
              if (rule.geometry_column_name) {
                state.mappings[j].geometry_column_name = rule.geometry_column_name;
                state.mappings[j].geometry_or_point = "geometry";
              }
              if (rule.point_lat_column_name) {
                state.mappings[j].point_lat_column_name = rule.point_lat_column_name;
                state.mappings[j].geometry_or_point = "points";
              }
              if (rule.point_lon_column_name) {
                state.mappings[j].point_lon_column_name = rule.point_lon_column_name;
                state.mappings[j].geometry_or_point = "points";
              }
              if (rule.property_column_name_list) {
                state.mappings[j].property_column_name_list = rule.property_column_name_list;
              }
            }
          }
        }
      }
      state.change_key = state.change_key + 1;
    }
    state.visualization = null;
    state.config = {};
    state.mapping_status = "gray";
    state.mapping_error = null;
  },
  setAllLayers (state, layers) {
    state.all_layers = layers;
  },
  setUserAttributes (state, attributes) {
    state.attributes = [];
    for(var attribute in attributes) {
      var new_attr = {}
      new_attr.name = attribute;
      new_attr.value = attributes[attribute];
      new_attr.edit = false;
      new_attr.override_value = null;
      state.attributes.push(new_attr);
    }
  },
  setPopupVisible (state, payload) {
    for (var i=0; i<state.pipeline.length; i++) {
      state.pipeline[i].local.popup_visible = false;
    }
    state.pipeline[payload.index].local.popup_visible = payload.value;
  },
  setDeleteVisible (state, payload) {
    for (var i=0; i<state.pipeline.length; i++) {
      state.pipeline[i].local.popup_visible = false;
    }
    for (var i=0; i<state.pipeline.length; i++) {
      state.pipeline[i].local.delete_visible = false;
    }
    state.pipeline[payload.index].local.delete_visible = payload.value;
  },
  setEditableProps (state, payload) {
    state.pipeline[payload.index].local.editable_props = payload.value;
  },
  moveStepUp (state, index) {
    var oldPipeline = state.pipeline;
    state.pipeline = [];
    for (var i=0; i<oldPipeline.length; i++) {
      if (i == index-1) {
        state.pipeline.push(oldPipeline[i+1]);
      } else if (i == index) {
        state.pipeline.push(oldPipeline[i-1]);
      } else {
        state.pipeline.push(oldPipeline[i]);
      }
    }
    for (var i=0; i<state.pipeline.length; i++) {
      state.pipeline[i].local.popup_visible = false;
    }
  },
  moveStepDown (state, index) {
    var oldPipeline = state.pipeline;
    state.pipeline = [];
    for (var i=0; i<oldPipeline.length; i++) {
      if (i == index + 1) {
        state.pipeline.push(oldPipeline[i-1]);
      } else if (i == index) {
        state.pipeline.push(oldPipeline[i+1]);
      } else {
        state.pipeline.push(oldPipeline[i]);
      }
    }
    for (var i=0; i<state.pipeline.length; i++) {
      state.pipeline[i].local.popup_visible = false;
    }
  },
  deleteStep (state, index) {
    state.pipeline.splice(index, 1);
  },
  setNormalLayers (state, normal_layers) {
    state.normal_layers = normal_layers;
  },
  setHeight (state, height) {
    state.height = height;
  },
  setSharedLayers (state, shared_layers) {
    state.shared_layers = shared_layers;
  },
  setTypesLayers (state, types_layers) {
    state.types_layers = types_layers;
  },
  setNormalLayersSelected (state, normal_layers) {
    state.normal_layers_selected = normal_layers;
  },
  setSharedLayersSelected (state, shared_layers) {
    state.shared_layers_selected = shared_layers;
  },
  setTypesLayersSelected (state, types_layer) {
    state.types_layers_selected = types_layer;
  },
  setQueryValue (state, payload) {
    for (var i=0; i<state.queries.length; i++) {
        if (state.queries[i].name == payload.query_name) {
          state.queries[i].query = payload.query;
        }
    }
  },
  storeQueryResults (state, payload) {
    state.pipeline[payload.index].local.results.push(payload.results);
  },
  resetQueryResults (state, index) {
    state.pipeline[index].local.results = [];
  },
  setMappingProp (state, payload) {
    if (payload.property == 'dataframe' || payload.property == 'geometry_or_point') {
      Vue.set(state.mappings[payload.index], "geometry_column_name", null);
      Vue.set(state.mappings[payload.index], "point_lat_column_name", null);
      Vue.set(state.mappings[payload.index], "point_lon_column_name", null);
      Vue.set(state.mappings[payload.index], "property_column_name_list", null);
    }
    Vue.set(state.mappings[payload.index], payload.property, payload.value)
  },
  setEmbedSetting (state, payload) {
    Vue.set(state.embed_settings, payload.property, payload.value)
  },
  setCustomVisualization (state, value) {
    state.custom_visualization = value;
  },
  setProp (state, payload) {
    if (payload.property == 'action') {
      state.pipeline[payload.index].local.error = null;
      if (state.pipeline[payload.index].action == 'sql_transform' && payload.value != 'sql_transform') {
        for (var i=0; i<state.queries.length; i++) {
            if (state.queries[i].name == state.pipeline[payload.index].query_name) {
              state.queries.splice(i, 1);
            }
        }
        //delete state.pipeline[payload.index].query_name;
        const keys = Object.keys(state.pipeline[payload.index]);
        for (const key of keys) {
          Vue.delete(state.pipeline[payload.index], key);
        }
        var local = {}
        local.status = "gray";
        local.popup_visible = false;
        local.delete_visible = false;
        local.editable_props = false;
        local.results_expanded = false;
        local.active = true;
        local.error = null;
        local.results = [];
        Vue.set(state.pipeline[payload.index], "layer", null);
        Vue.set(state.pipeline[payload.index], "shared", false);
        Vue.set(state.pipeline[payload.index], "local", local);
      } else if (state.pipeline[payload.index].action != 'sql_transform' && payload.value == 'sql_transform') {
        var new_index = state.queries.length;
        var new_query = {
          name: 'newquery' + new_index,
          layer: state.layer,
          query: ""
        };
        state.queries.push(new_query);
        const keys = Object.keys(state.pipeline[payload.index]);
        for (const key of keys) {
          Vue.delete(state.pipeline[payload.index], key);
        }
        var local = {}
        local.status = "gray";
        local.popup_visible = false;
        local.delete_visible = false;
        local.editable_props = false;
        local.results_expanded = false;
        local.active = true;
        local.error = null;
        local.results = [];
        Vue.set(state.pipeline[payload.index], "layer", null);
        Vue.set(state.pipeline[payload.index], "shared", false);
        Vue.set(state.pipeline[payload.index], "local", local);
        Vue.set(state.pipeline[payload.index], "query_name",'newquery' + new_index);
      }
    }

    if (payload.property == 'operation' && payload.value != 'SQL') {
      const keys = Object.keys(state.pipeline[payload.index]);
      for (const key of keys) {
        Vue.delete(state.pipeline[payload.index], key);
      }
      var local = {}
      local.status = "gray";
      local.popup_visible = false;
      local.delete_visible = false;
      local.editable_props = false;
      local.results_expanded = false;
      local.active = true;
      local.error = null;
      local.results = [];
      Vue.set(state.pipeline[payload.index], "layer", null);
      Vue.set(state.pipeline[payload.index], "shared", false);
      Vue.set(state.pipeline[payload.index], "action", "transform");
      Vue.set(state.pipeline[payload.index], "local", local);
    }

    if (payload.property == 'query_name') {
      for (var i=0; i<state.queries.length; i++) {
        if (state.queries[i].name == state.pipeline[payload.index].query_name) {
          state.queries[i].name = payload.value;
        }
      }
    }
    Vue.set(state.pipeline[payload.index], payload.property, payload.value)
  },
  setFilterProp (state, payload) {
    if (payload.property == 'edit') {
      for (var i=0; i<state.filters.length; i++) {
        Vue.set(state.filters[i], "edit", false)
      }
      for (var i=0; i<state.filters.length; i++) {
        Vue.set(state.attributes[i], "edit", false)
      }
    }
    Vue.set(state.filters[payload.index], payload.property, payload.value)
  },
  setAttributeProp (state, payload) {
    if (payload.property == 'edit') {
      for (var i=0; i<state.filters.length; i++) {
        Vue.set(state.filters[i], "edit", false)
      }
      for (var i=0; i<state.attributes.length; i++) {
        Vue.set(state.attributes[i], "edit", false)
      }
    }
    Vue.set(state.attributes[payload.index], payload.property, payload.value)
  },
  deleteFilter (state, index) {
    state.filters.splice(index, 1);
  },
  addFilter (state, index) {
    var newfilter = {
      name : "",
      urlparam : "",
      layer: null,
      inputoutput: "input",
      value: "",
      edit: false
    }
    state.filters.push(newfilter);
  },
  renameQuery (state, payload) {
    for (var i=0; i<state.queries.length; i++) {
        if (state.queries[i].name == payload.old_name) {
          state.queries[i].name = payload.new_name;
        }
    } 
  },
  newLayer(state) {
    state.layer = "New Layer";
    state.active = "layerconfig";
    state.normal_layers_selected = [];
    state.types_layers_selected = null;
    state.shared_layers_selected = [];
    state.queries = [];
    state.pipeline = [];
    state.filters = [];
    state.mappings = [];
    state.height = null;
    state.mapped_figure = null;
    state.change_key = state.change_key + 1;
    state.visualization = null;
    state.config = {};
    state.custom_visualization = "";
    state.mode = "pipeline";
    state.embed_type = null;
    state.embed_settings = {};
    state.embed_url = null;
  },
  addQuery(state, type) {
    if (type != 'looker_api') {
      var new_index = state.queries.length;
      var new_query = {
        name: 'newquery' + new_index,
        layer: state.layer,
        query: ""
      };
      state.queries.push(new_query);
      var step = {
        action: type + '_query',
        query_name: 'newquery' + new_index,
        layer: null,
        shared: false
      }
    } else {
      var step = {
        action: 'looker_query',
        layer: null,
        shared: false
      }
    }
    step.local = {}
    step.local.status = "gray";
    step.local.popup_visible = false;
    step.local.delete_visible = false;
    step.local.editable_props = false;
    step.local.results_expanded = false;
    step.local.active = true;
    step.local.error = null;
    step.local.results = [];
    state.pipeline.push(step);
    state.active = "pipeline";
  },
  addTransform(state) {
    var new_index = state.queries.length;
    var new_query = {
      name: 'newquery' + new_index,
      layer: state.layer,
      query: ""
    };
    state.queries.push(new_query);
    var step = {
      action: 'sql_transform',
      query_name: 'newquery' + new_index,
      layer: null,
      shared: false
    }
    step.local = {}
    step.local.status = "gray";
    step.local.popup_visible = false;
    step.local.delete_visible = false;
    step.local.editable_props = false;
    step.local.results_expanded = false;
    step.local.active = true;
    step.local.error = null;
    step.local.results = [];
    state.pipeline.push(step);
    state.active = "pipeline";
  },
  toggleExpandResults(state, index) {
    state.pipeline[index].local.results_expanded = !state.pipeline[index].local.results_expanded;
  },
  handleResults(state, response) {
    state.mapping_error = null;
    if (state.mode == 'pipeline') {
      var prev_df = null;
      var curr_df = null;
      for (var i=0; i<response.pipeline.length; i++) {
        if (response.pipeline[i].error_message || response.pipeline[i].traceback) {
          state.pipeline[i].local.results = [];
          state.pipeline[i].local.status = "red";
          if (response.pipeline[i].error_message) state.pipeline[i].local.error = response.pipeline[i].error_message;
          else state.pipeline[i].local.error = response.pipeline[i].traceback;
        } else {
          if (!response.pipeline[i].output_dataframes[0].dataframe_sample.length) continue;
          var results = response.pipeline[i].output_dataframes[0].dataframe_sample;
          var tmp_columns = Object.keys(results[0]);
          var columns = [];
          for (var j=0; j<tmp_columns.length; j++) {
            var column = {
              title: tmp_columns[j],
              dataIndex: tmp_columns[j]
            }
            columns.push(column);
          }
          for (var k=0; k< results.length; k++) {
            results[k].index = k;
          }
          if (state.pipeline[i].query_name) {
            curr_df = state.pipeline[i].query_name;
            prev_df = curr_df;
          } else if (state.pipeline[i].view) {
            curr_df = state.pipeline[i].view;
            prev_df = curr_df;
          } else if (prev_df) {
            curr_df = prev_df;
          } else {
            curr_df = "resp_df";
            prev_df = "resp_df";
          }
          var results_store = {
            rows: results.length,
            total_rows: response.pipeline[i].output_dataframes[0].dataframe_count,
            rendered_query: response.pipeline[i].query_rendered,
            data: results,
            columns: columns,
            name: curr_df
          }
          state.pipeline[i].local.error = null;
          state.pipeline[i].local.status = "green";
          state.pipeline[i].local.results = [];
          state.pipeline[i].local.results_expanded = false;
          state.pipeline[i].local.results.push(results_store);
        }
      }
    }

    if (!response.runToStep) {
      if (state.mode == 'pipeline') {
        var found_mapping_errors = false;
        for (var i=0; i<response.mappings.length; i++) { 
          if (response.mappings[i].error_message) {
            if (!state.mapping_error) {
              found_mapping_errors = true;
              state.mapping_error = response.mappings[i].error_message;
            } else {
              found_mapping_errors = true;
              state.mapping_error += "\n"
              state.mapping_error += response.mappings[i].error_message;
            }
          }
        }

        var mappings = [];
        for (var i=0; i<response.attributes.length; i++) {
          var mapping = response.attributes[i];
          mapping.column = null;
          mapping.columns = [];
          mapping.literal_val = "";
          mapping.literals = [];
          mapping.format = "";
          mapping.geometry_or_point = null;
          mapping.geometry_column_name = null;
          mapping.point_lat_column_name = null;
          mapping.point_lon_column_name = null;
          mapping.property_column_name_list = null;
          if (!mapping.dataframe) mapping.dataframe = null;
          for (var j=0; j<state.mappings.length; j++) {
            if (mapping.name == state.mappings[j].name) {
              mapping.layer = state.mappings[j].layer;
              mapping.column = state.mappings[j].column;
              var last_df = null;
              for (var k=0; k<state.pipeline.length; k++) {
                if (state.pipeline[k].query_name) last_df = state.pipeline[k].query_name;
                else if (state.pipeline[k].view) last_df = state.pipeline[k].view;
              }
              if (!state.mappings[j].dataframe) mapping.dataframe = last_df;
              else mapping.dataframe = state.mappings[j].dataframe;
              mapping.literal_val = state.mappings[j].literal_val;
              mapping.format = state.mappings[j].format;
              mapping.geometry_column_name = state.mappings[j].geometry_column_name;
              mapping.point_lat_column_name = state.mappings[j].point_lat_column_name;
              mapping.point_lon_column_name =state.mappings[j].point_lon_column_name;
              mapping.property_column_name_list = state.mappings[j].property_column_name_list;
              if (state.mappings[j].geometry_column_name != null) mapping.geometry_or_point = "geometry";
              if (state.mappings[j].point_lat_column_name != null) mapping.geometry_or_point = "points";
            }
          }
          mappings.push(mapping);
        }
        state.mapping_attributes = response.attributes;
        state.mappings = mappings;
      }
      if (response.custom_vis_error) {
        state.custom_vis_error = response.custom_vis_error;
        state.visualization = null;
      } else if (response.visualization) {
        state.custom_vis_error = null;
        state.visualization = response.visualization;
        state.mapped_figure = response.mapped_figure;
      } else if (response.embed_url) {
        state.embed_url = response.embed_url;
      }
      if (response.custom_vis_error || found_mapping_errors || response.mapping_error) state.mapping_status = "red";
      else state.mapping_status = "green";
    }
    //if (response.config.height) state.height = response.config.height + 16;
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations
}
