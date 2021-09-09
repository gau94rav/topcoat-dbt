import Vue from 'vue'
import axios from 'axios'

// initial state
const state = {
  git_configured: false,
  dbt_enabled: false,
  remote_url: null,
  deploy_key: null,
  branches: null,
  current_branch: null,
  target: null,
  refs_tree: null,
  expandedRefsList: [],
  refs_loading: false,
  expandedSchemaList: null,
  openedFolders: [],
}

// getters
const getters = {
}

// mutations
const mutations = {
  setGitConfigured (state, value) {
    state.git_configured = value;
  },
  setDbtEnabled (state, value) {
    state.dbt_enabled = value;
  },
  setRemoteURL (state, value) {
    state.remote_url = value;
  },
  setDeployKey (state, value) {
    state.deploy_key = value;
  },
  setCurrentBranch (state, value) {
    state.current_branch = value;
  },
  setBranches (state, value) {
    state.branches = value;
  },
  setTarget( state, value) {
    state.target = value;
  },
  setExpandedList (state, list) {
    state.expandedRefsList = list;
  },
  setRefsLoading (state, value) {
    state.refs_loading = value;
  },
  setExpandedRefsList (state, list) {
    state.expandedRefsList = list;
  },
  storeRefsTree (state, tree) {
    const treeWithId = [];
    for (let i in tree) {
      const row = tree[i];
      row.id = i + 1;
      treeWithId.push(row);
    }
    state.refs_tree = treeWithId;
  },
  setFileTree(state, ids) {
    state.openedFolders = ids;
  }
}

const actions = {
  updateDbt: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/dbt/update', payload)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  getDbtConfig: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/dbt/getDbtConfig')
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  resyncDbt: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/dbt/resync')
        .then((response) => {
          resolve(response);
        }, error => reject(error));
    })
  },

  resetDbt: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/dbt/resetDbt')
        .then(response => {
          resolve(response);
          commit('setGitConfigured', false);
          commit('setRemoteURL', null);
          commit('setDbtEnabled', false);
          commit('setDeployKey', null);
        }, error => reject(error));
    })
  },

  cloneDbt: ({commit}, data) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/dbt/cloneDbt', data)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  updateStates: ({commit}, payload) => {
    commit('setGitConfigured', payload.git_configured);
    commit('setRemoteURL', payload.remote_url);
    commit('setDbtEnabled', payload.dbt_enabled);
    commit('setDeployKey', payload.deploy_key);
    commit('setBranches', payload.branches);
    commit('setCurrentBranch', payload.current_branch);
    commit('setTarget', payload.target);
  },

  getDbtRefs: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/dbt/getDbtRefs')
        .then(response => {
          commit('storeRefsTree', response.data.refs);
          resolve(response);
        }, error => {
          commit('storeRefsTree', null);
          reject(error);
        });
    })
  },

  updateFileTree: ({commit}, ids) => {
    commit('setFileTree', ids);
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
