<template>
  <v-navigation-drawer width="64px" class="navigation-icons" permanent>
    <v-tooltip
      right
      v-for="(item, index) in items"
      :key='index'
    >
      <template v-slot:activator="{ on, attrs }">
        <v-list-item
          class="navigation-icon relative-center"
          :class='{"active-section-icon": sidebarVisible && active === item.key, "disabled-item": reloadingGit}'
          @click='setActive(item.key)'
          :disabled='reloadingGit'
          v-bind="attrs"
          v-on="on"
        >
          <!-- Icon -->
          <img v-if='item.icon && sideBarIcons[item.icon]' :src="sideBarIcons[item.icon]" />
          <span v-else-if='item.iconText' class="navigation-icon-text">{{ item.iconText }}</span>
          <span v-else class="navigation-icon-text">{{ item.key }}</span>
          <!-- Icon -->

        </v-list-item>
      </template>
      <span>{{ item.label }}</span>
    </v-tooltip>
  </v-navigation-drawer>
</template>

<script>
import { mapState } from 'vuex';
import { SmallSidebarMenu } from '../../../assets/constants/menus';

export default {
  data: () => ({
    items: SmallSidebarMenu,
    dbtEnabled: false,
  }),
  mounted() {
    this.getDbtEnabled();
  },
  computed: {
    sideBarIcons: function () {
      return {
        folder: static_url + "folder.svg",
        schema: static_url + "schema.svg",
        dag: static_url + "dag.svg",
        git: static_url + "git.svg",
      };
    },
    ...mapState('ide', [
      'activeMainSection',
      'sidebarVisible',
      'reloadingGit'
    ]),
    active: {
      get() {
        return this.activeMainSection;
      },
      set(section) {
        this.$store.dispatch('ide/toggleActiveSection', section);
        return section;
      }
    }
  },
  methods: {
    setActive(section) {
      if (this.active == section) {
        this.$store.dispatch('ide/addContainerSize', {
          container: 'lastChangedElement',
          size: !this.sidebarVisible ? '' : 'sidebar',
        });
        this.$store.dispatch('ide/toggleSidebar', !this.sidebarVisible);
      } else {
        this.$store.dispatch('ide/toggleSidebar', true);
      }
      this.active = section;
    },
    getDbtEnabled() {
      this.$store.dispatch('git/getDbtEnabled')
        .then(response => {
          if (!response.data.enabled) {
            this.items = this.items.filter(i => i.key !== 'dbt');
          }
        }).catch(error => {
          console.log(error);
        })
    },
  }
};
</script>

<style lang="less">
.navigation-icons {
  position: relative !important;
  z-index: 1001;
  .v-list-item {
    padding: 0px !important;
  }
}
.navigation-icons {
  background: #264653 !important;
  padding-top: 10px;
  .navigation-icon-text {
    color: #fff !important;
    font-size: 16px;
    font-family: "Montserrat-Medium";
    position: relative;
    // right: 3px;
  }
  .navigation-icon {
    cursor: pointer;
    transition: 0.3s;
    width: 45px;
    height: 45px !important;
    border-radius: 7px;
    margin-top: 10px;
    display: flex;
    padding: 0px;
    justify-content: center;
    &:hover {
      background: rgba(255, 255, 255, 0.16);
    }
  }
  .active-section-icon {
    background: rgba(255, 255, 255, 0.16);
  }
}
</style>