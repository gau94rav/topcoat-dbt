import Vue from 'vue'
import axios from 'axios';
import 'regenerator-runtime/runtime';


// initial state
const state = {
  file_tree: null,
  last_save_time: null,
  schema_tree: null,
  //file_tree: [ { key: 'foo.json', title: 'foo.json', children: [ { key: 'foo.json', title: 'foo.json', isLeaf: true, type: 'file' } ] }],
  selectedFileKey: null,
  selectedIndex: null,
  openFiles: [],
  modified: [],
  added: [],
  deleted: [],
  renamed: [],
  conflicts: [],
  expandedList: [],
  expandedSchemaList: [],
  commits_ahead: 0,
  commits_behind: 0,
  static_app_prefix: null,
  warehouses: null,
  warehouse: null,
  schemas: [],
  schema: null,
  schema_loading: false,
  databaseList: [],
  databaseCurrent: null,
  nav_mode: "files",
  snowflake_auth: false,
  dag_update_time: 0,
  full_dag: { 'nodes': null, 'edges': null },
  layer_dags: {},
  renameKey: '',
  renameValue: '',
  renamingProcess: false,
  openFolderIds: [1],
  branchLoading: false,
  lastOpenedKey: '',
  all_files: [],
  highlightedFile: '',
  openedFolders: [],
  buildErrors: {},
  buildErrorsSection: false,
  activeMainSection: 'folder',
  openedTabs: [],
  selectedTab: '',
  sqlSection: false,
  containerSizes: {
    sidebar: '250px',
    textEditor: 'calc(100% - 350px)',
    textEditorHeight: 'calc(-495px + 100vh)',
    maxOuterPaneHeight: null,
    sqlHeight: '300px',
    lastChangedElement: '',
  },
  searchQuery: '',
  activeSqlTab: 'tab-lineage',
  sidebarVisible: true,
  openedSchemaFolders: [],
  queryParam: {},
  urlRestored: false, // This is set to true when sql query params are restored first time on load (to avoid overwriting params to other files),
  editorScrollPosition: {},
  building: false,
  ideOverrideInstances: [],
  quickHelp: false,
  ideContext: {},
  contextItems: {},
  commitLoading: false,
  executingQuery: false,
  reloadingQuery: false,
  loadingFile: false,
}

function guidGenerator() {
  var S4 = function() {
     return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

// getters
const getters = {
  getOpenFiles(state) {
    return state.openFiles;
  }
}


function set_modified_list(node, list) {
  if (node && node.key && list.includes(node.key.substring(2))) {
    node.changes = true;
    //console.log("Setting modified for " + node.key);
    return;
  } else {
    node.changes = false;
  }
  if (node.children) {
    for (var j=0; j<node.children.length; j++) {
      set_modified_list(node.children[j], list)
    }
  }
}

function set_edit_mode(node, key, value) {
  if (key == node.key) {
    node.editMode = value;
    return; 
  }
  if (node.children) {
    for (var j=0; j<node.children.length; j++) {
      set_edit_mode(node.children[j], key, value)
    }
  }
}

// mutations
const mutations = {
  storeFileTree (state, file_tree) {
    const tree = file_tree && file_tree.length > 0 ? file_tree[0].children : [];
    state.all_files = tree;
    state.file_tree = tree;
  },
  setFileTree(state, tree) {
    state.file_tree = tree;
  },
  updateSavedTime(state) {
    state.last_save_time = Date.now()
  },
  storeSchemaTree (state, schema_tree) {
    const tree = [];
    if (schema_tree) {
      for (let schema of schema_tree) {
        schema.id = guidGenerator();
        const children = schema.children;
        const childrenWithIds = [];
        for (let child of children) {
          child.id = guidGenerator();
          childrenWithIds.push(child);
        }
        schema.children = childrenWithIds;
        if (schema.type != 'table' && !schema.children.length) {
          delete schema.children;
        }
        tree.push(schema);
      }
      state.schema_tree = tree;
    } else {
      state.schema_tree = schema_tree;
    }
    if (state.schema_tree) {
      for (var i=0; i<state.schema_tree.length; i++) {
        state.expandedSchemaList.push(state.schema_tree[i].key);
      }
    }
  },
  updateTreeNode(state, payload) {
    payload.treeNode.children = payload.children;
    payload.treeNode.loading = payload.loading;
  },
  setModified (state, modified) {
    state.modified = modified;
    if (!state.file_tree) return;
    set_modified_list(state.file_tree[0], modified);
  },
  setEditMode (state, payload) {
    set_edit_mode(state.file_tree[0],payload.key, payload.value);
  },
  setConflicts (state, conflicts) {
    state.conflicts = conflicts;
  },
  setAdded (state, added) {
    state.added = added;
  },
  setDeleted (state, deleted) {
    state.deleted = deleted;
  },
  setCommitsBehind (state, num) {
    state.commits_behind = num;
  },
  setCommitsAhead (state, num) {
    state.commits_ahead = num;
  },
  setRenamed (state, renamed) {
    state.renamed = renamed;
  },
  setNavMode (state, nav_mode) {
    state.nav_mode = nav_mode;
  }, 
  setSnowflakeAuth (state, value) {
    state.snowflake_auth = value;
  }, 
  setStaticAppPrefix (state, prefix) {
    state.static_app_prefix = prefix;
  },
  setExpandedList (state, list) {
    state.expandedList = list;
  },
  setSchemaLoading (state, value) {
    state.schema_loading = value;
  },
  setExpandedSchemaList (state, list) {
    state.expandedSchemaList = list;
  },
  setDatabaseList (state, list) {
    state.databaseList = list;
  },
  setWarehouseCurrent (state, current) {
    state.warehouse = current;
  },
  setWarehouseList (state, list) {
    state.warehouses = list;
  },
  setSchemaCurrent (state, current) {
    state.schema = current;
  },
  setSchemaList (state, list) {
    state.schemas = list;
  },
  setDatabaseCurrent (state, current) {
    state.databaseCurrent = current;
  },
  setSelectedFileKey (state, key) {
    state.selectedFileKey = key; 
    for (var i=0; i<state.openFiles.length; i++) {
      if (key == state.openFiles[i].key) {
        state.selectedIndex = i;
      }
    }
  },
  addOpenFile (state, payload) {
    // Remove if it already exists for some reason
    for (var i=0; i<state.openFiles.length; i++) {
      if (payload.key == state.openFiles[i].key) {
        state.openFiles.splice(i, 1);
        break;
      }
    }
    var length = state.openFiles.push({
      file_name: payload.file_name,
      contents: payload.contents,
      key: payload.key,
      emptySuccess: false,
      queryErrors: [],
      activeResultsTab: 'results',
      queryResults: null,
      queryCount: null,
      rendered_sql: null,
      filter_overrides: {},
      attribute_overrides: {},
      visualize: false,
      changes: false,
      dag: { 'nodes': [], 'edges': [] }
    })
    state.selectedFileKey = payload.key;
    state.selectedIndex = length - 1;
    return;
  },
  renameOpenFileIfOpen(state, payload) {
    for (var i=0; i<state.openFiles.length; i++) {
      if (payload.old_key == state.openFiles[i].key) {
        state.openFiles[i].key = payload.new_key;
        state.openFiles[i].file_name = "foobar";
        break;
      } 
    }
  },
  removeOpenFile (state, key) {
    const files = state.openFiles.filter(f => {
      return f.key != key;
    });
    state.openedTabs = state.openedTabs.filter(sf => sf.key != key);
    state.openFiles = files;
    const currentFile = state.openFiles.filter(f => f.key === state.lastOpenedKey)[0];
    if (currentFile) {
      for (let index in files) {
        let file = files[index];
        if (file.key === currentFile.key) {
          state.selectedIndex = index;
          break;
        }
      }
    }
  },
  resetOpenFiles(state) {
    state.openFiles = [];
    state.selectedFileKey = null;
    state.selectedIndex = null;
  },
  storeFileContents (state, payload) {
    state.openFiles[payload.index].contents = payload.contents;
  },
  storeFileContentsByKey (state, payload) {
    for (var i=0; i<state.openFiles.length; i++) {
      //console.log("i=", + i + ",open: " + state.openFiles[i].key + ",payload=" + payload.key);
      if (payload.key == state.openFiles[i].key) {
        Vue.set(state.openFiles[i], "contents", payload.contents);
        //console.log("SETTING NEW CONTENTS for " + i)
      }
    }
  },
  storeFilterOverride(state, payload) {
    if (payload.value == "") Vue.set(state.openFiles[payload.index].filter_overrides, payload.filter, null);
    else Vue.set(state.openFiles[payload.index].filter_overrides, payload.filter, payload.value);
  },
  storeAttributeOverride(state, payload) {
    if (payload.value == "") Vue.set(state.openFiles[payload.index].attribute_overrides, payload.filter, null);
    else Vue.set(state.openFiles[payload.index].attribute_overrides, payload.filter, payload.value);
  },
  updateOpenFileAttribute (state, payload) {
    for (var i=0; i<state.openFiles.length; i++) {
      if (payload.key == state.openFiles[i].key) {
        //console.log("i=", + i + ",open: " + state.openFiles[i].key + ",payload=" + payload.key + ",attribute=" + payload.attribute);
        Vue.set(state.openFiles[i], payload.attribute, payload.value);
      }
    }
  },
  updateOpenFileDag(state, payload) {
    for (var i=0; i<state.openFiles.length; i++) {
      if (payload.key == state.openFiles[i].key) {
        Vue.set(state.openFiles[i]['dag'], 'nodes', payload.nodes);
        Vue.set(state.openFiles[i]['dag'], 'edges', payload.edges);
      }
    }
  },
  updateFullDag(state, payload) {
    if (payload.nodes && payload.edges) {
      Vue.set(state.full_dag, 'nodes', payload.nodes);
      Vue.set(state.full_dag, 'edges', payload.edges);
    }
    for (const [layer, dag] of Object.entries(payload.layer_dags)) {
        state.layer_dags[layer] = {
          nodes: dag.nodes,
          edges: dag.edges
        }
    }
    state.dag_update_time = Date.now()
  },
  setRenameKey(state, key) {
    state.renameKey = key;
  },
  setRenameValue(state, value) {
    state.renameValue = value;
  },
  setRenamingProcess(state, toggle) {
    state.renamingProcess = toggle;
  },
  setOpenFolderIds(state, ids) {
    state.openFolderIds = ids;
  },
  setBranchLoading(state, toggle) {
    state.branchLoading = toggle;
  },
  setLastOpened(state, key) {
    state.lastOpenedKey = key;
  },
  updateOpenedFolders(state, tree) {
    state.openedFolders = tree;
  },
  setHighlightedFile(state, key) {
    state.highlightedFile = key;
  },
  setFilterFiles(state, data) {
    const files = data.all_files;
    const filtered = [];
    const recursive = (query, files) => {
      for (let file of files) {
        if (file.title.toLowerCase().includes(query)) {
          if (!state.openedFolders.includes(file.key)) state.openedFolders.push(file.key);
          filtered.push(file);
        }
        if (file.children) {
          recursive(query, file.children);
        }
      }
    }
    recursive(data.query, files);
    state.file_tree = filtered;
  },
  storeBuildErrors(state, errors) {
    let buildErrors = JSON.parse(JSON.stringify(state.buildErrors));
    state.buildErrors = {};
    if (errors.length) {
      for (let index in errors) {
        const file = errors[index];
        if (file === 'reset') {
          buildErrors = {};
          continue;
        }
        if (file.message) {
          buildErrors[file.path] = file.message;
        } else {
          delete buildErrors[file.path];
        }
      }
    }
    state.buildErrors = buildErrors;
  },
  setActiveMainSection(state, toggle) {
    state.activeMainSection = toggle;
  },
  addToOpenedTabs(state, file) {
    const openedTabs = state.openedTabs;
    const alreadyAdded = openedTabs.filter(i => i.key === file.key).length > 0;
    if (!alreadyAdded) {
      openedTabs.push(file);
    }
  },
  setBuildErrorsSection(state, toggle) {
    state.buildErrorsSection = toggle;
  },
  setSelectedTab(state, tab) {
    state.selectedTab = tab;
  },
  setSqlSection(state, toggle) {
    state.sqlSection = toggle;
  },
  resetEverything(state) {
    state.openedTabs = [];
    state.openFiles = [];
    state.file_tree = [];
    state.all_files = [];
    state.highlightedFile = '';
    state.openedFolders = [];
    state.buildErrors = {};
    state.buildErrorsSection = false;
    state.selectedTab = '';
    state.buildErrorsSection = false;
    state.sqlSection = false;
  },
  setContainerSize(state, data) {
    state.containerSizes[data.container] = data.size;
  },
  setSearchQuery(state, query) {
    state.searchQuery = query;
  },
  setActiveTab(state, tab) {
    state.activeSqlTab = tab;
  },
  setSidebarVisible(state, toggle) {
    state.sidebarVisible = toggle;
  },
  setScehemaOpenedTree(state, ids) {
    state.openedSchemaFolders = ids;
  },
  setQueryParam(state, payload) {
    state.queryParam[payload.key] = payload.data;
  },
  setUrlRestored(state, toggle) {
    state.urlRestored = toggle;
  },
  setScrollPosition(state, data) {
    state.editorScrollPosition[data.index] = data.position;
  },
  setBuilding(state, building) {
    state.building = building;
  },
  setIdeOverrideInstances(state, instance) {
    if (!instance) {
      state.ideOverrideInstances = [];
    } else {
      state.ideOverrideInstances.push(instance);
    }
  },
  setQuickHelp(state, toggle) {
    state.quickHelp = toggle;
  },
  setIdeContext(state, obj) {
    state.ideContext = obj;
  },
  setContextItems(state, obj) {
    const data = {
      items: obj.items || [],
      description: obj.context.documentation || '',
    };
    state.contextItems[obj.context.label] = data;
  },
  setCommitLoading(state, toggle) {
    state.commitLoading = toggle;
  },
  setExecutingQuery(state, toggle) {
    state.executingQuery = toggle;
  },
  setLoadingFile(state, toggle) {
    state.loadingFile = toggle;
  },
  setReloadingQuery(state, toggle) {
    state.reloadingQuery = toggle;
  }
}

const actions = {
  getFileContents: ({commit, dispatch}, payload) => {
    dispatch('toggleFileLoading', true);
    return new Promise((resolve, reject) => {
      if (!payload.file_name) return;
      axios.post('/api/ide/getFileContents', payload)
        .then(response => {
          dispatch('toggleFileLoading', false);
          resolve(response);
        }, error => {
          reject(error);
          dispatch('toggleFileLoading', false);
        });
    })
  },

  getFileContentsAwait: async ({commit}, payload) => {
    const request = await axios.post('/api/ide/getFileContents', payload);
    return request.data;
  },

  saveFileContentsByKey: ({commit}, data) => {
    commit('storeFileContentsByKey', data);
  },

  setFileIndex: ({commit}, key) => {
    commit('setSelectedFileKey', key);
  },

  addFileToOpenList: ({commit}, data) => {
    commit('addOpenFile', data);
  },

  removeFileFromList: ({commit}, key) => {
    commit('removeOpenFile', key);
  },

  openFileAtrribute: ({commit}, data) => {
    commit('updateOpenFileAttribute', data);
  },

  storeFileData: ({commit}, data) => {
    commit('storeFileContents', data);
  },

  saveFileContents: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/ide/storeFileContents', payload)
        .then(response => {
          if (response.data.errors.length > 0) {
            commit('storeBuildErrors', response.data.errors);
          } else {
            commit('storeBuildErrors', [{
              path: payload.file_name.slice(1),
              message: '',
            }]);
          }
          resolve(response);
        }, error => reject(error))
    })
  },

  getDag: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/ide/getDag')
        .then(response => {
          if (response.data.full_dag) {
            commit('updateFullDag', {
              nodes: response.data.full_dag.nodes,
              edges: response.data.full_dag.edges,
              layer_dags: response.data.layer_dags,
            })
          }
          resolve(response);
        }, error => reject(error))
    })
  },

  updateDag: ({commit}, payload) => {
    commit('updateFullDag', payload);
  },

  getBranchStatus: ({commit}, mode = 'admin') => {
    commit('setBranchLoading', true);
    return new Promise((resolve, reject) => {
      axios.get('/api/git/getBranchStatus')
        .then(response => {
          commit('setModified', response.data.modified);
          commit('setConflicts', response.data.conflicts);
          commit('setAdded', response.data.added);
          commit('setDeleted', response.data.deleted);
          commit('setRenamed', response.data.renamed);
          commit('setBranchLoading', false);
          if (mode === 'admin') {
            commit('setCommitsBehind', response.data.commits_behind);
            commit('setCommitsAhead', response.data.commits_ahead);
          }
          resolve(response);
        }, error => {
          reject(error);
          commit('setBranchLoading', false);
        });
    })
  },

  resetOpenedFiles: ({commit}) => {
    commit('resetOpenFiles');
  },

  commitUserBranch: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/git/commitUserBranch', payload)
        .then((response) => {
          commit('setModified', []);
          commit('setConflicts', []);
          commit('setAdded', []);
          commit('setDeleted', []);
          commit('setRenamed', []);
          commit('setCommitsBehind', null);
          commit('setCommitsAhead', null);
          resolve(response);
        }, error => reject(error))
    })
  },

  getFileList: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/ide/getFileList')
        .then(response => {
          commit('storeFileTree', response.data.tree);
          resolve(response);
        }, error => reject(error));
    })
  },

  getStaticAppPrefix: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/ide/getStaticAppPrefix')
      .then((response)  =>  {
        commit('setStaticAppPrefix', response.data.prefix);
        resolve(response);
      }, error => reject(error));
    })
  },

  addNewFile: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/ide/addNewFile', payload)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  makeDir: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/ide/makeDir', payload)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  deleteItem: ({commit}, path) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/ide/deletePath', { path })
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  renameAbleFile: ({commit}, key) => {
    commit('setRenameKey', key);
  },

  renameValue: ({commit}, value) => {
    commit('setRenameValue', value);
  },

  renamePath: ({commit}, data) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/ide/renamePath', data)
      .then(response => {
        commit('setRenameKey', '');
        commit('setRenameValue', '');
        resolve(response);
      }, error => reject(error));
    })
  },

  renamingProcess: ({commit}, toggle) => {
    commit('setRenamingProcess', toggle);
  },

  addToOpenFolders: ({commit}, ids) => {
    commit('setOpenFolderIds', ids);
  },

  upload: ({commit}, options) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/ide/uploadFile', options.data, { headers: options.headers })
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  build: ({commit}, payload) => {
    if (payload.reset) {
      commit('storeBuildErrors', ['reset']);
      commit('setBuilding', true);
      delete payload.reset;
    }
    return new Promise((resolve, reject) => {
      axios.post('/api/ide/build', payload)
        .then(response => {
          commit('setBuilding', false);
          if (response.data.status && response.data.status === 'error') {
            commit('storeBuildErrors', response.data.errors);
          }
          resolve(response);
        }, error => {
          commit('setBuilding', false);
          reject(error);
        });
    })
  },

  attributeOverride: ({commit}, payload) => {
    commit('storeAttributeOverride', payload);
  },

  filterOverride: ({commit}, payload) => {
    commit('storeFilterOverride', payload);
  },

  filterAttributeDefaults: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/ide/getFilterAttributeDefaults')
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  runQuery: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/ide/query', payload)
        .then(response => resolve(response))
        .catch(error => reject(error));
    })
  },

  downloadCSV: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/ide/downloadCSV', payload)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  schemaLoading: ({commit}, toggle) => {
    commit('setSchemaLoading', toggle);
  },

  schemaTree: ({commit}, tree) => {
    commit('storeSchemaTree', tree);
  },

  getSchema: ({commit}, payload) => {
    commit('setSchemaLoading', true);
    commit('storeSchemaTree', null);
    return new Promise((resolve, reject) => {
      axios.post('/api/ide/getSchema', payload)
        .then(response => {
          commit('storeSchemaTree', response.data.schema);
          commit('setSchemaLoading', false);
          resolve(response);
        }, error => {
          commit('setSchemaLoading', false);
          commit('storeSchemaTree', null);
          reject(error);
        });
    })
  },

  updateSchemaTreeNode: ({commit}, payload) => {
    commit('updateTreeNode', payload);
  },

  getTableSchema: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/ide/getTableSchema', payload)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  lastOpened: ({commit}, key) => {
    commit('setLastOpened', key);
  },

  cancelRename: ({commit}) => {
    commit('setRenameKey', '');
    commit('setRenameValue', '');
  },

  updateOpenedFolders: ({commit}, tree) => {
    commit('updateOpenedFolders', tree);
  },

  highlightedTreeFile: ({commit}, key) => {
    if (key) {
      commit('setHighlightedFile', key);
    }
  },

  filterFiles: ({commit}, query) => {
    commit('setFilterFiles', query);
  },

  addBuildErrors: ({commit}, errors) => {
    commit('storeBuildErrors', errors);
  },

  toggleActiveSection: ({commit}, toggle) => {
    commit('setActiveMainSection', toggle);
  },

  addSelectedTab: ({commit}, file) => {
    commit('addToOpenedTabs', file);
  },

  toggleErrorSection: ({commit}, toggle) => {
    commit('setBuildErrorsSection', toggle);
  },
  selectedTab: ({commit}, tab) => {
    commit('setSelectedTab', tab);
  },
  toggleSqlSection: ({commit}, toggle) => {
    commit('setSqlSection', toggle);
  },
  resetVariables: ({commit}) => {
    commit('resetEverything');
  },
  addContainerSize: ({commit}, data) => {
    commit('setContainerSize', data);
  },
  searchQuery: ({commit}, query) => {
    commit('setSearchQuery', query);
  },
  activeTab: ({commit}, tab) => {
    commit('setActiveTab', tab);
  },
  toggleSidebar: ({commit}, toggle) => {
    commit('setSidebarVisible', toggle);
  },
  updateSchemaOpenedTree: ({commit}, ids) => {
    commit('setScehemaOpenedTree', ids);
  },
  updateFileTree: ({commit}, tree) => {
    commit('setFileTree', tree);
  },
  addQueryParam: ({commit}, payload) => {
    commit('setQueryParam', payload);
  },
  urlRestoredToggle: ({commit}, toggle) => {
    commit('setUrlRestored', toggle);
  },
  addScrollPosition: ({commit}, data) => {
    commit('setScrollPosition', data);
  },
  handleIdeOverrideInstances: ({commit}, instance) => {
    commit('setIdeOverrideInstances', instance);
  },
  handleQuickHelp: ({commit}, toggle) => {
    commit('setQuickHelp', toggle);
  },
  handleIdeContext: ({commit}, obj) => {
    commit('setIdeContext', obj);
  },
  handleContextItems: ({commit}, obj) => {
    commit('setContextItems', obj);
  },
  toggleCommitLoading: ({commit}, toggle) => {
    commit('setCommitLoading', toggle);
  },
  toggleQueryExecution: ({commit}, toggle) => {
    commit('setExecutingQuery', toggle);
  },
  toggleFileLoading: ({commit}, toggle) => {
    commit('setLoadingFile', toggle);
  },
  toggleQueryReload: ({commit}, toggle) => {
    commit('setReloadingQuery', toggle);
  },
  loadFile: ({dispatch, getters}, obj) => {

    const key = obj.file.key;

    dispatch('lastOpened', key);
    dispatch('addSelectedTab', obj.file);
    dispatch('highlightedTreeFile', key);
    if (obj.selectTab) {
      dispatch('selectedTab', obj.selectTab);
    }

    // If already in list, set the active index.
    const alreadyOpened = getters.getOpenFiles.filter((f) => f.key === key).length > 0;
    if (alreadyOpened) {
      return dispatch('setFileIndex', key);
    }
    // If file is image
    if (obj.instance.$isImage(key)) {
      const file_name = key.slice(1);
      dispatch('addFileToOpenList', {
        key: key,
        file_name,
        contents: '',
      })
      return dispatch('setFileIndex', key);
    }

    // If file is not an image.
    const file_name = key.slice(1);
    dispatch('getFileContents', { file_name })
      .then(response => {
        const contents = response.data.contents || '';
        dispatch('addFileToOpenList', {
          key: key,
          contents,
          file_name
        });
        dispatch('setFileIndex', key);
      }).catch(error => {
        obj.instance.$alert({type: 'error', message: `Failed to open '${file_name.replace('/', '')}'.`});
        dispatch('removeFileFromList', key);
        obj.instance.$resetUrl('develop');
        console.log(error);
      })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
