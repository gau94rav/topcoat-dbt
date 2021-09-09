<template>
  <v-app v-if="initialized" id="components-layout-demo-top-side-2" class="app-container">
    <iframe :src="authRefresh" style="display: none;"></iframe>
    <password-change v-if='passwordChange' @refresh='passwordChangeRefresh' />
    <div v-else class="view-section">
      <Header />
      <div class="alert-content"></div>
      <router-view></router-view>
    </div>
  </v-app>
</template>

<script>
import Header from "./components/Header";
import { mapState } from "vuex";
import { authMixin } from "./components/Mixins/auth";
import { eventBus } from "./main";
import PasswordChange from './components/PasswordChange';

export default {
  name: "App",
  components: { Header, PasswordChange },
  mixins: [authMixin],
  data() {
    return {
      collapsed: false,
      initialized: false,
      authRefresh: null,
      passwordChange: false,
    };
  },
  computed: {
    ...mapState("admin", ["role"]),
    appMode: function () {
      return app_mode;
    },
    frontEndTitle: function () {
      return front_end_title;
    },
    imgURL: function () {
      return static_url + "topcoat-light-logo.svg";
    },
  },
  methods: {
    passwordChangeRefresh() {
      this.passwordChange = true;
      this.checkSessionInternal(true);
    },
    passwordChangeRequired() {
      this.$store.dispatch('auth/passwordChangeRequired')
        .then(response => {
          this.initialized = true;
          this.passwordChange = response.data.change_required;
        }).catch(error => {
          this.passwordChange = false;
          console.log(error);
        })
    },
    getUserRole() {
      this.$store.dispatch('admin/getUserRole')
        .then(() => {
          this.initialized = true;
        }).catch(error => {
          console.log(error);
        })
    }
  },
  created() {
    this.initAuth();
    this.passwordChangeRequired();
    this.getUserRole();

    eventBus.$on("check_session", () => {
      this.checkSessionInternal(true);
    });

    document.addEventListener(
      "keydown",
      function (e) {
        if (
          e.keyCode == 83 &&
          (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)
        ) {
          e.preventDefault();
          eventBus.$emit("save_key");
        }
      },
      false
    );
  },
};
</script>

<style lang='less' src='./assets/styles/fonts.less'></style>
<style lang='less' src='./assets/styles/global.less'></style>
<style lang='less' src='./assets/styles/vuetifyTable.less'></style>
<style lang='less' src='./assets/styles/modals.less'></style>