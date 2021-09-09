import Vue from "vue";
import store from './store'
import Antd from 'ant-design-vue'
import "ant-design-vue/dist/antd.less";
import App from "./App";
import router from './router';
import 'codemirror/lib/codemirror.css';
import VueCodemirror from 'vue-codemirror';
import MonacoEditor from 'vue-monaco';
import Clipboard from 'v-clipboard';
import TopCoatLogo from './assets/topcoat-dark-logo.svg';
import TopCoatLogoLight from './assets/topcoat-light-logo.svg';
import Folder from './assets/folder.svg';
import Schema from './assets/schema.svg';
import PlayIcon from './assets/play.svg';
import DagIcon from './assets/dag.svg';
import GitIcon from './assets/git.svg';
import MagnifyIcon from './assets/magnifying-glass-search.svg';

import BrickSQLLogo from './assets/bright_color.png';
import DbtIcon from './assets/dbt-icon.png';
import TopcoatIcon from './assets/topcoat-icon-tp.png';
import axios from 'axios';
import '@mdi/font/css/materialdesignicons.css';
import vuetify from './vuetify';
import helpers from './helpers';

Vue.use(Clipboard)
Vue.config.productionTip = false;
Vue.use(Antd);

export const eventBus = new Vue();

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";

axios.interceptors.request.use(function (config) {
    // Do something before request is sent
    eventBus.$emit("check_session");
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
  });

axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response.status == 401) {
    	console.log("Redirect to login (axios)");
      window.location.href = "/login/auth0?next=" + window.location.href;
    }
    return Promise.reject(error);
  });

// you can set default global options and events when use
Vue.use(VueCodemirror, /* { 
  options: { theme: 'base16-dark', ... },
  events: ['scroll', ...]
} */)

const app = new Vue({
  router,
  store,
  vuetify,
  components: { App },
  template: '<App/>',
  icons: {
    iconfont: 'mdi',
  },
}).$mount('#app')