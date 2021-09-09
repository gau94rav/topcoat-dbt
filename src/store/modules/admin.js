import Vue from 'vue'
import axios from 'axios';

// initial state
const state = {
  role: null,
  log_entries: [],
  groups: [],
  users: [],
  app_metadata: [],
  app_metadata_valid: [],
  new_user_metadata: null,
  new_user_metadata_valid: true,
  group_metadata: [],
  group_metadata_valid: [],
  new_group_metadata: null,
  new_group_metadata_valid: true,
  connections: null,
  connection: null,
  activeAdminSection: '',
  updatingConnectionIndex: -1,
  deletingConnectionIndex: -1,
  testingConnectionIndex: -1,
}

// getters
const getters = {
}

// mutations
const mutations = {
  storeLogEntries (state, entries) {
    if (!entries) return;
    for (let entry of entries) {
      entry.timestamp = (new Date(entry.created * 1000)).toLocaleString();
    }

    let log_entries = state.log_entries;
    log_entries = log_entries.concat(entries);

    for (let index in log_entries) {
      log_entries[index].key = index;
    }
    state.log_entries = log_entries;
  },
  storeGroups(state, groups) {
    state.groups = groups;
  },
  storeUsers(state, users) {
    state.users = users;
  },
  storeUserRole(state, role) {
    state.role = role;
  },
  storeAllAppMetadata(state, app_metadata) {
    state.app_metadata = app_metadata;
  },
  storeAllGroupMetadata(state, group_metadata) {
    state.group_metadata = group_metadata;
  },
  storeAllAppMetadataValid(state, app_metadata_valid) {
    state.app_metadata_valid = app_metadata_valid;
  },
  storeAllGroupMetadataValid(state, group_metadata_valid) {
    state.group_metadata_valid = group_metadata_valid;
  },
  storeNewUserMetadata(state, metadata) {
    state.new_user_metadata = metadata;
  },
  storeNewUserMetadataValid(state, valid) {
    state.new_user_metadata_valid = valid;
  },
  storeUserMetadata (state, user) {
    Vue.set(state.app_metadata, user.index, user.metadata);
    Vue.set(state.app_metadata_valid, user.index, user.valid);
  },
  storeNewGroupMetadata(state, metadata) {
    state.new_group_metadata = metadata;
  },
  storeNewGroupMetadataValid(state, valid) {
    state.new_group_metadata_valid = valid;
  },
  storeGroupMetadata(state, group) {
    Vue.set(state.group_metadata, group.index, group.metadata);
    Vue.set(state.group_metadata_valid, group.index, group.valid);
  },
  setConnections (state, connections) {
    state.connections = connections;
  },
  setActiveConnection (state, connection) {
    state.connection = connection;
  },
  setActiveAdminSection (state, section) {
    state.activeAdminSection = section;
  },
  setDeletingConnectionIndex(state, index) {
    state.deletingConnectionIndex = index;
  },
  setUpdatingConnectionIndex(state, index) {
    state.updatingConnectionIndex = index;
  },
  setTestingConnectionIndex(state, index) {
    state.testingConnectionIndex = index;
  }
}

const actions = {
  getLogs: ({commit}, time) => {
    return new Promise((resolve, reject) => {
      axios.get(`/api/admin/getLogs/${time}`)
        .then(response => {
          commit('storeLogEntries', response.data.entries);
          resolve(response);
        }, error => reject(error));
    })
  },

  newUserMetadata: ({commit}, data) => {
    commit('storeNewUserMetadata', data);
  },

  newUserMetadataValid: ({commit}, valid) => {
    commit('storeNewUserMetadataValid', valid);
  },

  newGroupMetadata: ({commit}, data) => {
    commit('storeNewGroupMetadata', data);
  },

  newGroupMetadatValid: ({commit}, valid) => {
    commit('storeNewGroupMetadataValid', valid)
  },

  userMetadata: ({commit}, data) => {
    commit('storeUserMetadata', data);
  },

  groupMetadata: ({commit}, data) => {
    commit('storeGroupMetadata', data);
  },

  getUsers: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/admin/queryUsers')
        .then(response => {
          const users = response.data.users;
          const allAppMetadata = [];
          const allAppMetadataValid = [];
          for (let loopIndex in users) {
            users[loopIndex].index = loopIndex;
            const metadata = Object.assign({}, users[loopIndex].app_metadata);
            delete metadata.set_initial_password;
            delete metadata.allowed_domains;
            delete metadata.allowed_subdomains;
            delete metadata.customer_id;
            delete metadata.app_admin;
            delete metadata.role;
            delete metadata.group_id;
            allAppMetadata.push(JSON.stringify(metadata, null, 2));
            allAppMetadataValid.push(true);
          }
          commit('storeUsers', users);
          commit('storeAllAppMetadata', allAppMetadata);
          commit('storeAllAppMetadataValid', allAppMetadataValid);
          resolve(response);
        }, error => reject(error));
    })
  },

  getUserGroups: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/admin/queryGroups')
        .then(response => {
          const groups = response.data.groups;
          const groupsMetadata = [];
          const groupsMetadataValid = [];
          for (let index in groups) {
            groups[index].index = index;
            let metadata = Object.assign({}, groups[index].metadata);
            delete metadata.persona;
            groupsMetadata.push(JSON.stringify(metadata, null, 2));
            groupsMetadataValid.push(true);
          }
          commit('storeGroups', groups);
          commit('storeAllGroupMetadata', groupsMetadata);
          commit('storeAllGroupMetadataValid', groupsMetadataValid);
          resolve(resolve);
        }, error => reject(error));
    })
  },

  createNewUser: ({commit}, data) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/admin/createUser', data)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  updateUser: ({commit}, data) => {
    return new Promise((resolve, reject) => {
      const url = `/api/admin/updateUserMetadata/${data.email}`;
      axios.post(url, {metadata: data.metadata})
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  sendPasswordResetRequest: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/admin/requestPasswordLink', payload)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  deleteUser: ({commit}, email) => {
    return new Promise((resolve, reject) => {
      const url = `/api/admin/deleteUser/${email}`;
      axios.post(url)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  getPersonas: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/admin/queryPersonas')
        .then(response => {
          resolve(response)
        }, error => reject(error));
    })
  },

  createNewGroup: ({commit}, data) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/admin/createGroup', data)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  updateGroup: ({commit}, data) => {
    return new Promise((resolve, reject) => {
      const url = `/api/admin/updateGroup/${data.id}`;
      axios.post(url, data)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  deleteGroup: ({commit}, id) => {
    return new Promise((resolve, reject) => {
      const url = `/api/admin/deleteGroup/${id}`;
      axios.post(url)
        .then(response => {
          resolve(response)
        }, error => reject(error))
    })
  },

  queryConnections: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/admin/queryConnections')
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  getUserRole: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/admin/getUserRole')
        .then(response => {
          commit('storeUserRole', response.data.role);
          resolve(response);
        }, error => reject(error));
    })
  },

  testConnection: ({commit}, data) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/admin/testConnection', data)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    });
  },

  deleteConnection: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post(`/api/admin/deleteConnection`, payload )
        .then((response)  =>  {
          resolve(response);
        }, (error)  =>  {
          reject(error);
        })
    })
  },

  setConnections: ({commit}, data) => {
    commit('setConnections', data);
  },

  storeConnections: ({commit}, allConnections) => {
    const connections = [];
    for (let index in allConnections) {
      if (
        allConnections[index].type == "bigquery" ||
        allConnections[index].type == "sqlite3" ||
        allConnections[index].type == "postgres" ||
        allConnections[index].type == "snowflake" ||
        allConnections[index].type == "looker_api"
      ) {
        allConnections[index].connection_index = index;
        connections.push(allConnections[index]);
      }
    }
    commit('setConnections', connections);
  },

  activeConnection: ({commit}, id) => {
    commit('setActiveConnection', id);
  },

  editConnection: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/admin/editConnection', payload)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  legacyConnections: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get('/api/admin/legacyConnections')
        .then((response)  =>  {
          resolve(response);
        }, (error)  =>  {
          reject(error);
        })
    })
  },

  addConnection: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.post('/api/admin/addConnection', payload)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },

  adminSection: ({commit}, path) => {
    commit('setActiveAdminSection', path);
  },

  deleteConnectionIndex: ({commit}, index) => {
    commit('setDeletingConnectionIndex', index);
  },

  updateConnectionIndex: ({commit}, index) => {
    commit('setUpdatingConnectionIndex', index);
  },

  testConnectionIndex: ({commit}, index) => {
    commit('setTestingConnectionIndex', index);
  }

}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
