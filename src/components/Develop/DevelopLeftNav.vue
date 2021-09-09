<template>
  <div class='sidebar-container'>
    <small-sidebar  />
    <transition name='slide-fade'>
      <div
        v-if='showSection'
        class="side-bar-section" 
      >
        <file-manager-sidebar
          v-if='activeSection === "folder"'
          @action='$emit("action", $event)'
          @refresh="$emit('refreshAll')"
          @sizeChanged='setPaneWidth'
        />
        <git-manager-sidebar
          v-if='activeSection === "git"'
          @reloadEverything='$emit("refreshAll")'
          @reloadOpenFiles='$emit("reloadOpenFiles")'
          @sizeChanged='setPaneWidth'
        />
        <develop-schema v-if='activeSection === "schema"' @sizeChanged='setPaneWidth' />
        <dbt-section v-if='activeSection === "dbt"' @sizeChanged='setPaneWidth' />
      </div>
      </transition>
  </div>
</template>

<script>

import { mapState } from 'vuex'
import SmallSidebar from './Layouts/SmallSidebar';
import FileManagerSidebar from './Layouts/FileManagerSidebar';
import GitManagerSidebar from './Layouts/GitManagerSidebar';
import DevelopSchema from './DevelopSchema';
import DbtSection from './DbtSection';

export default {
    name: "DevelopLeftNav",
    components : {
      SmallSidebar,
      FileManagerSidebar,
      GitManagerSidebar,
      DevelopSchema,
      DbtSection,
    },
    data () {
      return {
      	customStyle: 'border-radius: 4px;margin-bottom: 10px;border: 0;overflow: hidden',
        layers: ["bar-template","custom-template", "map-template-tiny",	"mapbox-template", "sv-indicator-template", "choropleth-template", "line-template",	"map-template",	"single-value-template", "table-template"],
        selected: null,
        commitDialogVisible: false,
        comment: "",
        commit_error: null,
        change_error: null,
        committing: false,
        changing: false,
    	}
    },
    computed: {
      ...mapState('ide', [
        'commits_ahead',
        'commits_behind',
        'modified',
        'added',
        'conflicts',
        'renamed',
        'nav_mode',
        'deleted',
        'openFiles',
        'full_dag',
        'dag_update_time',
        'activeMainSection',
        'containerSizes',
        'sidebarVisible'
      ]),
      ...mapState('git', [
        'branches',
        'current_branch',
        'remote_url',
        'app_mode'
      ]),
      activeSection() {
        return this.activeMainSection;
      },
      showSection() {
        return this.sidebarVisible;
      }
    },
    methods: {
      addSelectedFiles(item) {
        this.$emit('selected', item);
      },
      setPaneWidth(pane, container, size) {
        if (parseInt(size.replace('px', '')) <= 20) {
          this.$store.dispatch('ide/toggleSidebar', false);
          return this.$store.dispatch('ide/addContainerSize', {
            container: 'sidebar',
            size: '250px'
          });
        }
        this.$store.dispatch('ide/addContainerSize', {
          container: 'sidebar',
          size
        });
      }
    },
}
</script>

<style lang='less'>
  .sidebar-container {
    display: flex;
    .side-bar-section {
      transition: 0.3s;
      .navigation-files-drawer {
        transition: 0.3s;
        position: relative;
      }
    }
  }
  @media (max-width: 1110px) {
    .side-bar-section {
      position: absolute;
      left: 64px;
      z-index: 100;
    }
    .show-sidebar {
      display: block !important;
    }
  }

</style>
