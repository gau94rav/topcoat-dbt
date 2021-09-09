import axios from 'axios';

// initial state
const state = {
  last_refresh: 0
}

// getters
const getters = {
}

// mutations
const mutations = {
  setLastRefresh (state, refresh) {
    state.last_refresh = refresh;
  }
}

const actions = {
  setPassword: ({commit}, payload) => {
    return new Promise((resolve, reject) => {
      axios.defaults.xsrfCookieName = "csrftoken";
      axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
      axios.post('/api/admin/setPassword', payload)
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },
  passwordChangeRequired: ({commit}) => {
    return new Promise((resolve, reject) => {
      axios.get("/api/admin/passwordChangeRequired")
        .then(response => {
          resolve(response);
        }, error => reject(error));
    })
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}
