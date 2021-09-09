<template>
  <div v-if="true">
    <v-navigation-drawer
      class="navigation-files-drawer-admin"
      permanent
    >
      <div class="route-container py-10">
        <admin-nav-item title="Connections" route="/admin/connections">
          <template slot-scope="{color}">
            <v-icon :color='color' class="admin-nav-icons">
              mdi-connection
            </v-icon>
          </template>
        </admin-nav-item>
        <admin-nav-item title="Git Configuration" route="/admin/git">
          <template slot-scope="{color}">
            <git-icon :color="color" class="admin-nav-icons" />
          </template>
        </admin-nav-item>
        <admin-nav-item title="Development Mode" route="/admin/devmode">
          <template slot-scope="{color}">
            <code-icon :color="color" class="admin-nav-icons" />
          </template>
        </admin-nav-item>
        <admin-nav-item title="Users" route="/admin/users">
          <template slot-scope="{color}">
            <user-icon :color="color" class="admin-nav-icons" />
          </template>
        </admin-nav-item>
        <admin-nav-item title="Groups" route="/admin/groups">
          <template slot-scope="{color}">
            <group-icon :color="color" class="admin-nav-icons" />
          </template>
        </admin-nav-item>
        <admin-nav-item title="dbt Connector" route="/admin/dbt">
          <template slot-scope="{color}">
            <dbt-icon :color="color" class="admin-nav-icons" />
          </template>
        </admin-nav-item>
        <!-- <admin-nav-item title="Secret" route="/admin/secrets">
          <template slot-scope="{color}">
            <secret-icon :color="color" class="admin-nav-icons" />
          </template>
        </admin-nav-item> -->
        <admin-nav-item title="Logs" route="/admin/logs">
          <template slot-scope="{color}">
            <log-icon :color="color" class="admin-nav-icons" />
          </template>
        </admin-nav-item>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<style lang='less'>
.navigation-files-drawer-admin {
  flex-direction: row !important;
  width: 315px !important;
  background: #f8f9fd !important;
  display: block !important;
  .route-container {
    display: flex;
    flex-direction: column;
    .admin-nav-icons {
      padding-left: 20px;
      width: 40px;
    }
    .v-list-item__content {
      padding: 5px !important;
      .nav-link {
        display: flex;
        color: #272727;
        align-items: center;
        font-size: 14px;
        font-family: "Montserrat-Regular";
        transition: 0.3s;
        height: 48px;
        border-radius: 5px;
        &:hover {
          background: rgba(162, 196, 201, 0.2);
        }
      }
      .highlighted-admin-nav {
        background: rgba(162, 196, 201, 0.2);
      }
    }
  }
}

@media (max-width: 960px) {
  .navigation-files-drawer-admin {
    width: max-content !important;
    .route-container {
      .route-title {
        display: none;
        width: max-content;
      }
      .admin-nav-icons {
        padding: 10px 12px;
        width: 43px !important;
        display: flex;
        justify-content: center;
      }
    }
    .v-list-item__content {
      overflow: initial !important;
    }
  }
}

</style>

<script>
import { mapState, mapMutations } from "vuex";
import axios from "axios";
import GitIcon from "../common/ComponentIcons/GitIcon";
import CodeIcon from "../common/ComponentIcons/CodeIcon";
import GroupIcon from "../common/ComponentIcons/GroupIcon";
import UserIcon from "../common/ComponentIcons/UserIcon";
import SecretIcon from "../common/ComponentIcons/SecretIcon";
import DbtIcon from '../common/ComponentIcons/DbtIcon';
import LogIcon from '../common/ComponentIcons/LogIcon';

import AdminNavItem from "./AdminNavItem";

export default {
  name: "AdminLeftNav",
  components: {
    GitIcon,
    CodeIcon,
    GroupIcon,
    UserIcon,
    SecretIcon,
    AdminNavItem,
    DbtIcon,
    LogIcon,
  },
  data() {
    return {
      collapsed: false,
      initialized: false,
      legacyConnections: false,
    };
  },
  computed: {
    ...mapState("git", ["app_mode"]),
    ...mapState("admin", ["role"]),
    currentTab: function () {
      //console.log("current: " + this.$route.path.split('/')[2]);
      return this.$route.path.split("/")[2];
    },
    navWidth: function () {
      if (this.collapsed) {
        return "70px";
      } else {
        //console.log("Not collapsed")
        return "256px";
      }
    },
    navWidthOuter: function () {
      if (this.collapsed) {
        return "80px";
      } else {
        //console.log("Not collapsed")
        return "266px";
      }
    },
  },
  methods: {
    collapse: function () {
      //console.log("Collapse event");
      this.collapsed = !this.collapsed;
    },
  },
};
</script>
