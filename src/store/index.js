import Vue from 'vue'
import Vuex from 'vuex'
import studio from './modules/studio'
import git from './modules/git'
import ide from './modules/ide'
import auth from './modules/auth'
import admin from './modules/admin'
import dbt from './modules/dbt'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    studio,
    git,
    ide,
    auth,
    admin,
    dbt,
  },
  strict: debug
})
