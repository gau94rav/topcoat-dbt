import Vue from 'vue'
import axios from 'axios';

// initial state
const state = {
  configured: false,
  dev_enabled: false,
  remote_url: null,
  dev_branch: null,
  branches: null,
  deploy_key: null,
  current_branch: "master",
  app_mode: null,
  reloadingGit: false,
}

// getters
const getters = {
  redirect_uri: state => {
      if (state.app_mode == 'sqlide') {
        if (state.configured && state.dev_enabled) {
          return '/develop'
        } else {
          return '/admin'
        }
      } else if (state.app_mode == 'wld') {
        return '/studio'
      } else {
        return '/admin'
      }
    }
}

// mutations
const mutations = {
  setConfigured (state, value) {
    state.configured = value;
  },
  setDevEnabled (state, value) {
    state.dev_enabled = value;
  },
  setRemoteURL (state, value) {
    state.remote_url = value;
  },
  setDevBranch (state, value) {
    state.dev_branch = value;
  },
  setDeployKey (state, value) {
    state.deploy_key = value;
  },
  setBranches (state, branches) {
    state.branches = branches;
  },
  setCurrentBranch (state, branch) {
    state.current_branch = branch;
  },
  setAppMode (state, mode) {
    state.app_mode = mode;
  },
  setReloadingGit(state, toggle) {
    state.reloadingGit = toggle;
  },
}

const actions = {
  resetGitConfig: ({ commit }) => {
    return new Promise((resolve, reject) => {
        axios.get("/api/git/resetGit").then(response => {
            commit('setConfigured', false);
            commit('setRemoteURL', null);
            commit('setCurrentBranch', null);
            resolve(response);
        }, error => reject(error) )
    })
  },

  cloneMaster: ({ commit }, data) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/git/cloneMaster', data)
        .then(response => {
          resolve(response);
        }, error => reject(error) )
    })
  },

  reloadBranches: ({ commit }) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/git/getBranches')
        .then(response => {
          commit('setBranches', response.data.branches);
          resolve(response);
        }, error => reject(error) );
    })
  },

  getGitConfig: ({ commit }, mode = 'git') => {
    return new Promise((resolve, reject) => {
      axios.get('/api/git/getGitConfig')
        .then(response => {

          switch(mode) {

            case 'git':
              commit('setRemoteURL', response.data.remote_url);
              commit('setDeployKey', response.data.deploy_key);
              commit('setConfigured', response.data.configured);
              break;
            
            case 'develop':
              commit('setDevEnabled', response.data.dev_enabled);
              commit('setCurrentBranch', response.data.current_branch);
              commit('setConfigured', response.data.configured);
              break;
            
            case 'filetree':
              commit('setCurrentBranch', response.data.current_branch);
              break;

            case 'main':
              commit('setConfigured', response.data.configured);
              commit('setDevEnabled', response.data.dev_enabled);
              commit('setRemoteURL', response.data.remote_url);
              commit('setAppMode', response.data.app_mode);
              break;
          }

          resolve(response);
        })
    })
  },

  generateSshKey: () => {
    return new Promise((resolve, reject) => {
      axios.get('/api/git/generateSSHKey')
        .then(response => {
          resolve(response);
        }, error => reject(error) )
    })
  },

  enableDevelopmentMode: ({commit}, data) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/git/enableDevelopment', data)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  disableDevelopmentMode: ({commit}, data) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/git/disableDevelopment', data)
        .then(response => {
          resolve(response);
        }, error => reject(error))
    })
  },

  getAdminSecrets: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/admin/secrets')
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  saveAdminSecrets: ({commit}, data) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/admin/secrets', data)  
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  pullOriginBranch: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/git/pullOriginUserBranch')
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  deployUserBranch: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/git/deployUserBranch')
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  changeBranch: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/git/changeBranch', payload)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  getDbtEnabled: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/dbt/getDbtEnabled')
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  pullBranch: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/git/pullBranch', payload)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  revertBranch: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/git/revertBranch', payload)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  toggleReloadingGit: ({commit}, toggle) => {
    commit('setReloadingGit', toggle);
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
