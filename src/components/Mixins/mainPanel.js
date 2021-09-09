import { mapState, mapGetters, mapMutations } from 'vuex';
import axios from 'axios';

export const mainPanelMixin = {
  props: {
      index: Number
  },
  data () {
    return {
      customStyle: 'background: #f4f4f8;border-radius: 4px;margin-bottom: 12px;border: 0;overflow: hidden',
      prop_columns : [{
        title: 'property',
        width: 180,
        className: 'propertyColumn',
        dataIndex: 'property'
      }, {
        title: 'value',
        dataIndex: 'value',
        scopedSlots: { customRender: 'value' },
      }]
    }
  },
  methods: {
    handleLookerModelChange: function(value) {
      var payload = {
        index: this.index,
        property: "model",
        value: value
      }
      this.setProp(payload);
    },
    handleLookerViewChange: function(value) {
      var payload = {
        index: this.index,
        property: "view",
        value: value
      }
      this.setProp(payload);
    },
    handleLookerLimitChange: function(value) {
      var payload = {
        index: this.index,
        property: "limit",
        value: parseInt(value)
      }
      this.setProp(payload);
    },
    handleAllowedFiltersChange(value, key, allowed_index) {
      var current_allowed = [];
      for (var i=0; i<this.pipeline[this.index].allowed_filters.length; i++) {
        current_allowed.push(Object.assign({}, this.pipeline[this.index].allowed_filters[i]));
      }
      current_allowed[allowed_index][key] = value;
      var payload = {
        index: this.index,
        property: "allowed_filters",
        value: current_allowed
      }
      this.setProp(payload);
    },
    handleSortChange(value, sort_index) {
      var current_sorts = [];
      for (var i=0; i<this.pipeline[this.index].sort.length; i++) {
        current_sorts.push(this.pipeline[this.index].sort[i]);
      }
      current_sorts[sort_index] = value;
      var payload = {
        index: this.index,
        property: "sort",
        value: current_sorts
      }
      this.setProp(payload);
    },
    deleteSortItem(sort_index) {
      var current_sorts = [];
      for (var i=0; i<this.pipeline[this.index].sort.length; i++) {
        if (sort_index == i) continue;
        current_sorts.push(this.pipeline[this.index].sort[i]);
      }
      var payload = {
        index: this.index,
        property: "sort",
        value: current_sorts
      }
      this.setProp(payload);
    },
    addSortItem() {
      var current_sorts = [];
      if (this.pipeline[this.index].sort) {
        for (var i=0; i<this.pipeline[this.index].sort.length; i++) {
          current_sorts.push(this.pipeline[this.index].sort[i]);
        }
      }
      current_sorts.push("");
      var payload = {
        index: this.index,
        property: "sort",
        value: current_sorts
      }
      this.setProp(payload);
    },
    deleteAllowedFilter(allowed_index) {
      var current_allowed = [];
      for (var i=0; i<this.pipeline[this.index].allowed_filters.length; i++) {
        if (allowed_index == i) continue;
        current_allowed.push(Object.assign({}, this.pipeline[this.index].allowed_filters[i]));
      }
      var payload = {
        index: this.index,
        property: "allowed_filters",
        value: current_allowed
      }
      this.setProp(payload);
    },
    addAllowedFilter() {
      var current_allowed = [];
      if (this.pipeline[this.index].allowed_filters) {
        for (var i=0; i<this.pipeline[this.index].allowed_filters.length; i++) {
          current_allowed.push(Object.assign({}, this.pipeline[this.index].allowed_filters[i]));
        }
      }
      var newAllowed = {
        attribute_name: "",
        looker_filter_name: ""
      }
      current_allowed.push(newAllowed);
      var payload = {
        index: this.index,
        property: "allowed_filters",
        value: current_allowed
      }
      this.setProp(payload);
    },
    handleLookerFiltersChange(value, key, filter_index) {
      var current_filters = Object.assign({}, this.pipeline[this.index].filters);
      var current_filters_array = Object.entries(this.pipeline[this.index].filters);

      if (key == 'name') {
        current_filters_array[filter_index][0] = value;
      } else if (key == 'value')
        current_filters_array[filter_index][1] = value;

      var current_filters = {};

      for (var i=0; i<current_filters_array.length; i++) {
        current_filters[current_filters_array[i][0]] = current_filters_array[i][1]
      }
      var payload = {
        index: this.index,
        property: "filters",
        value: current_filters
      }
      this.setProp(payload);
    },
    deleteLookerFilter(name) {
      var current_filters = Object.assign({}, this.pipeline[this.index].filters);
      delete current_filters[name];
      var payload = {
        index: this.index,
        property: "filters",
        value: current_filters
      }
      this.setProp(payload);
    },
    addLookerFilter() {
      var current_filters = Object.assign({}, this.pipeline[this.index].filters);
      if (!current_filters) current_filters = {};
      current_filters["newfilter"] = "";
      var payload = {
        index: this.index,
        property: "filters",
        value: current_filters
      }
      this.setProp(payload);
    },
    handleLookerFieldsChange: function(values) {
      var payload = {
        index: this.index,
        property: "fields",
        value: values
      }
      this.setProp(payload);
    },
    handleQueryNameChange: function(value) {
      var payload = {}
      
      var old_val = this.pipeline[this.index].query_name
      payload = {
        old_name: old_val,
        new_name: value
      }
      this.renameQuery(payload);
      payload = {
        index: this.index,
        property: "query_name",
        value: value
      }
      this.setProp(payload);
    },
    getQueryByName: function(query_name) {
      for (var i=0; i<this.queries.length; i++) {
        if (this.queries[i].name == query_name) {
          return this.queries[i].query;
        }
      }
      return null;
    },
    runPipelineToStep() {
        var partialPipeline = []
        for (var i=0; i<this.pipeline.length && i<=this.index; i++) {
          partialPipeline.push(this.pipeline[i]);
        }
        var request = {
          layer: this.layer,
          dependent_layers: this.dependent_layers,
          queries: this.queries,
          pipeline: partialPipeline,
          filters: this.filters,
          attributes: this.attributes
        };
        
        axios.post('/api/studio/runPipeline', request)
        .then((response)  =>  {
            //console.log(response.data.profile);
            response.data.profile.runToStep = true;
            this.handleResults(response.data.profile);
            //this.loadModalVisible = true;
        }, (error)  =>  {
            console.log("Run pipeline failed");
        })
    },
    getQueryPropertiesTable: function() {
      const properties = [
      {
        key: 'connection',
        property: 'Connection',
        value: this.pipeline[this.index].action.split('_')[0]
      },
      {
        key: 'query_name',
        property: 'Query Name',
        connections: [ 'bigquery', 'sqlite3', 'snowflake', 'postgres' ],
        value: this.pipeline[this.index].query_name
      }, 
      {
        key: 'model',
        property: 'Model',
        connections: [ 'looker_api' ],
        value: this.pipeline[this.index].model
      },
      {
        key: 'view',
        property: 'View',
        connections: [ 'looker_api' ],
        value: this.pipeline[this.index].view
      },
      {
        key: 'fields',
        property: 'Fields',
        connections: [ 'looker_api' ],
        value: this.pipeline[this.index].fields
      },
      {
        key: 'allowed_filters',
        property: 'Allowed Filters',
        connections: [ 'looker_api' ],
        value: this.pipeline[this.index].allowed_filters
      },
      {
        key: 'limit',
        property: 'Limit',
        connections: [ 'looker_api' ],
        value: this.pipeline[this.index].limit
      },
      {
        key: 'sort',
        property: 'Sort',
        connections: [ 'looker_api' ],
        value: this.pipeline[this.index].sort
      },
      {
        key: 'filters',
        property: 'filters',
        connections: [ 'looker_api' ],
        value: this.pipeline[this.index].filters
      }
      ];
      var returned_props = [];
      if (!this.connections.length) return null;
      for (var i=0; i<properties.length; i++) {
        if (!properties[i].connections) returned_props.push(properties[i]);
        //console.log("properties[i].connections");
        if (properties[i].connections && properties[i].connections.indexOf(this.connections[this.connection].type) != -1) returned_props.push(properties[i]);
      }
      return returned_props;
    },
    ...mapMutations('studio', [
        'setQueryValue',
        'setEditableProps',
        'setProp',
        'renameQuery',
        'storeQueryResults',
        'resetQueryResults',
        'handleResults'
      ])
  },
  computed: {
    transform_properties_table: function() {
      var transformProperties = []

      for (var i=0; i<this.transform_options.length; i++) {
        if (this.transform_options[i].restrict.length == 0 ||
          this.transform_options[i].restrict.indexOf(this.pipeline[this.index].operation) >= 0 ||
          (this.transform_options[i].name == 'query_name' && this.pipeline[this.index].action == 'sql_transform')) {
            var propObj = {
              key: this.transform_options[i].name,
              property: this.transform_options[i].label,
              value: this.pipeline[this.index][this.transform_options[i].name],
              type: this.transform_options[i].type
            }
            if (this.pipeline[this.index].action == 'sql_transform' && this.transform_options[i].name == 'operation') {
              propObj.value = 'SQL';
            }
            if (this.transform_options[i].options) propObj.options = this.transform_options[i].options;
            transformProperties.push(propObj);
        }
      }
      return transformProperties;
    },
    query: {
      get () {
          for (var i=0; i<this.queries.length; i++) {
            if (this.queries[i].name == this.pipeline[this.index].query_name) {
              return this.queries[i].query;
            }
          }
      },
      set (value) {
        var payload = {
          query_name: this.pipeline[this.index].query_name,
          query: value
        }
        this.setQueryValue(payload);
      }
    },
    connection: {
      get () {
        //console.log("CONNECTIONS");
        //console.log(this.connections);
        for (var i=0; i<this.connections.length; i++) {
          if (this.pipeline[this.index].action.split('_')[0] == this.connections[i].type.replace("_api","")) {
            if (this.pipeline[this.index].connection) {
              if (this.pipeline[this.index].connection == this.connections[i].name) return i;
            } else {
              return i;
            }
          }
        }
        return null;
      },
      set (value) {
        this.selectedIndex = value;
        var type = this.connections[value].type.replace("_api","");
        var payload = {
          index: this.index,
          property: "action",
          value: type + '_query'
        }
        this.setProp(payload)
        if (this.connections[value].name) {
          payload = {
            index: this.index,
            property: "connection",
            value: this.connections[value].name
          }
          this.setProp(payload)
        }
      }
    },
    ...mapState('studio', [
        'pipeline',
        'layer',
        'dependent_layers',
        'queries',
        'transform_options'
      ])
  }
}