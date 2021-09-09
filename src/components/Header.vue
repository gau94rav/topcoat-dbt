<template>
  <v-app-bar class="header"  height="60px" background='#fff' >
    <div class="left-section">
      <img class="logo" :src="imgURL" />
      <navbar-tabs class="ml-10 navbar-tabs" />
    </div>

    <div class="right-section">
      <div class="repository-section">
        <div class="repository-details">
          <div class="repository-title">
            <div>Branch:</div>
            <div class="branch-title">{{ current_branch }}</div>
          </div>
          <div class="nav-seperator"></div>
          <div class="repository-title">
            <div>Repository:</div>
            <a :href="'https://github.com/' + friendlyGitName">{{ friendlyGitName }}</a>
          </div>
        </div>
        <menu-toggle class="menu-toggle" />
      </div>
    </div>
  </v-app-bar>
</template>

<script>
import { mapState } from "vuex";
import NavbarTabs from "./common/NavbarTabs";
import DagDialog from './common/DagDialog';
import MenuToggle from './common/MenuToggle';

export default {
  name: "Header",
  components: { NavbarTabs, DagDialog, MenuToggle },
  computed: {
    imgURL: function () {
      return static_url + "topcoat-light-logo.svg";
    },
    friendlyGitName: function () {
      if (!this.remote_url) return "";
      else
        return this.remote_url
          .replace(".git", "")
          .replace("git@github.com:", "");
    },
    ...mapState("git", ["remote_url", "current_branch"]),
    ...mapState("admin", [
      "connection",
      "connections",
    ]),
  },
  methods: {
    refreshConnections() {
      this.$store.dispatch('admin/queryConnections')
        .then(response => {
          this.$store.dispatch('admin/storeConnections', response.data.connections);
          if (this.connection == null && response.data.connections.length)
            this.$store.dispatch('admin/activeConnection', 0);
        }).catch(error => console.error(error));
    },
  },
  created() {
    this.refreshConnections();
    this.$store.dispatch('ide/getDag').catch(error => console.error(error));
    this.$store.dispatch('git/getGitConfig', 'main').catch(error => console.error(error));
  },
};
</script>


<style lang='less'>
.header {
  position: sticky !important;
  width: 100%;
  top: 0;
  margin: auto;
  z-index: 10;
  flex: 0 !important;
  box-shadow: 0 3px 16px 0 rgba(111, 136, 185, 0.16) !important;
  background: #fff !important;
  color: #272727;
  .left-section {
    display: flex;
    float: left;
    width: 100%;
    .v-tabs-slider {
      background: #2a9d8f !important;
    }
    .logo {
      width: 171px;
      height: 40px;
      position: relative;
      bottom: 0;
      margin: auto 50px;
      transition: 0.3s;
    }
  }
  .right-section {
    padding: 0 15px;
    float: right;
    font-family: "Montserrat-Regular";
    .repository-section {
      display: flex;
      align-items: center;
      font-size: 12px;
      .repository-details {
        display: flex;
        align-items: center;
      }
      .arrow-down {
        position: relative;
        top: 1px;
        left: 5px;
        cursor: pointer;
      }
      .nav-seperator {
        width: 0;
        height: 25px;
        border: solid 1px #d1d5db;
        margin: 0 20px;
      }
      .repository-title {
        display: flex;
        color: #707070;
        width: max-content;
        .branch-title,
        a {
          color: #272727;
          text-decoration: none !important;
          padding-left: 10px;
        }
      }
      .repository-controls {
        display: flex;
        align-items: flex-end;
        margin-left: 21px;
        .v-btn {
          text-transform: none !important;
          font-size: 14px;
          margin: 0 2px;
          color: #272727;
          .btn-title {
            padding-left: 1px;
            letter-spacing: 0px;
            text-decoration: none !important;
            color: #272727;
          }
        }
      }
    }
  }
}
@media (max-width: 1024px) {
  .header {
    .left-section {
      .logo {
        margin: auto 0px;
      }
    }
    .right-section {
      .repository-details {
        font-size: 10px;
      }
    }
  }
}

@media (max-width: 960px) {
  .header {
    .right-section {
      .repository-section {
        .repository-details {
          align-items: flex-end !important;
        }
        .nav-seperator {
          display: none;
        }
        .repository-details {
          flex-direction: column;
        }
      }
      .menu-toggle {
        transition: 0.3s;
        position: relative;
        animation-name: highlight;
        animation-duration: 0.3s;
        animation-iteration-count: 2;
        animation-timing-function: linear;
      }
    }
  }
}
</style>
