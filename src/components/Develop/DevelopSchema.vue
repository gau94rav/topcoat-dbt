<template>
  <div>
    <multipane class="vertical-panes" @paneResizeStop='(...args) => this.$emit("sizeChanged", ...args)'>
      <v-navigation-drawer
        :width="containerSizes.sidebar"
        class="navigation-files-drawer"
        background="#264653"
        permanent
      >
        <v-item-group class="d-flex justify-space-between align-center top-gap">
          <v-list-item-title class="list-title">SCHEMA</v-list-item-title>
          <div class="d-flex align-end">
            <v-icon @click='toggleMenu' class="default-icon-size mr-1">mdi-cog-outline</v-icon>
            <v-icon v-if='!schema_loading' @click='loadSchema(true)' class="cursor-pointer default-icon-size">mdi-reload</v-icon>
            <v-icon v-else class="spinner-loader default-icon-size">mdi-loading</v-icon>
          </div>
        </v-item-group>
        <div class="spacer-div mb-3"></div>
        <small v-if='!schema_tree || !schema_tree.length'>No schema found</small>
        <v-treeview
          v-if='schema_tree'
          open-on-click
          :items='schema_tree'
          :load-children='onLoadData'
          :open.sync='opened'
          item-key="key"
        >
          <template v-slot:prepend='{item}'>
            <v-icon class="spinner-loader" v-if='item.loading'>mdi-loading</v-icon>
            <v-icon v-else-if='item.type === "schema_or_dataset"'>mdi-file-cabinet</v-icon>
            <v-icon v-else-if='item.type === "table"'>mdi-table-large</v-icon>
          </template>
          <template #label='{item}'>
              <template>
                <div
                  @mouseenter="toggleData($event, item)"
                  @mouseleave="toggleData($event, null)"
                  class="file-name"
                >
                  <div>{{ item.title }}</div>
                  <v-icon
                    style='padding: 2px'
                    class="square-btn ref-add-btn ml-3"
                    v-if='openFiles.length &&
                    openFiles[selectedIndex].key !== item.key && 
                    $getLanguage(openFiles[selectedIndex].key) === "sql" &&
                    item.type === "column"'
                    @click='addKey($event, item.key)'
                  >
                    mdi-code-braces
                  </v-icon>
                </div>
              </template>
          </template>
        </v-treeview>
      </v-navigation-drawer>
      <multipane-resizer></multipane-resizer>
    </multipane>
    <context-menu
      :position='menuPosition'
      :show='menuShow'
      :options='contextMenu'
      @close='menuShow = false'
      @selected='handleMenuAction'
    />
    <connection-switch-modal
      @close='switchDataSourceModal = false'
      v-if='switchDataSourceModal'
      @refresh='loadSchema'
    />
    <popover
      v-if="Object.keys(toggle).length"
      :show='toggle'
      :top='popoverPosition.y'
      :left='`${parseInt(containerSizes.sidebar.replace("px", "")) + 65}px`'
    >
      <div class="flex-column" style="font-size: 12px">
        <div class="d-flex py-1">
            <div class="dbt-title">Column: &nbsp;</div>
            <div class="dbt-desc">{{ toggle.title }}</div>
        </div>
        <div class="d-flex py-1">
            <div class="dbt-title">Data Type: &nbsp;</div>
            <div class="dbt-desc">{{ toggle.field_type  }}</div>
        </div>
      </div>
    </popover>
  </div>
</template>

<script>

import { mapState } from 'vuex';
import ContextMenu from '../common/ContextMenu';
import ConnectionSwitchModal from './ConnectionSwitchModal';
import { Multipane, MultipaneResizer } from 'vue-multipane';
import { eventBus } from '../../main';
import Popover from '../common/Popover';

export default {
  name: "DevelopSchema",
  components : {
    ContextMenu,
    ConnectionSwitchModal,
    Multipane,
    MultipaneResizer,
    Popover
  },
  data () {
    return {
      selected: null,
      hoverKey: null,
      pendingConnection: null,
      switchDataSourceModal: false,
      contextMenu: [
        {
          icon: 'mdi-file-cabinet',
          iconType: 'ui',
          label: 'Switch Schema Connection',
          action: 'switch_schema'
        }
      ],
      menuPosition: {
        x: 0,
        y: 0,
      },
      menuShow: false,
      toggle: {},
      popoverPosition: {
        x: 0,
        y: 0,
      },
    }
  },
  computed: {
    ...mapState('ide', [
      'schema_tree',
      'schema_loading',
      'databaseCurrent',
      'openFiles',
      'selectedIndex',
      'containerSizes',
      'openedSchemaFolders',
    ]),
    ...mapState('admin', [
      'connections',
      'connection',
    ]),
    opened: {
      get() {
        return this.openedSchemaFolders;
      },
      set(ids) {
        this.$store.dispatch('ide/updateSchemaOpenedTree', ids);
      }
    }
  },
  mounted() {
    if (!this.schema_tree) {
      this.loadSchema();
    }
  },
  methods: {
    addKey(e, key) {
        e.stopPropagation();
        eventBus.$emit("cm_add_text", key);
    },
    toggleData(e, file) {
      if (file && file.type === "column") {
        this.popoverPosition.x = e.clientX + 'px';
        this.popoverPosition.y = (e.clientY - 20) + 'px';
        return this.toggle = file;
      }
      return this.toggle = {};
    },
    toggleMenu(e) {
      this.menuPosition.x = e.clientX;
      this.menuPosition.y = e.clientY;
      this.menuShow = true;
    },
    loadSchema(force_refresh = false) {
      this.switchDataSourceModal = false;
      this.$store.dispatch('ide/getSchema', {
        force_refresh,
        connection: this.connections[this.connection]
      }).catch(error => console.log(error));
    },
    openSwitchConnectionModal() {
      this.pendingConnection = null;
      this.switchDataSourceModal = true;
    },
    onLoadData(treeNode) {
      const current = this;
      if (treeNode.type == 'table' && !treeNode.children.length) {
        return new Promise((resolve, reject) => {
          this.$store.dispatch('ide/getTableSchema', {
            connection: current.connections[current.connection],
            node: treeNode,
            database_name: current.databaseCurrent
          }).then(response => {
            resolve(response.data.schema);
            this.$store.dispatch('ide/updateSchemaTreeNode', {
              treeNode: treeNode,
              loading: false,
              children: response.data.schema
            })
          }).catch(error => {
            console.log(error);
          })
        })
      }
    },
    handleMenuAction(action) {
      switch(action) {
        case 'switch_schema':
          this.switchDataSourceModal = true;
          break;
      }
    }
  }
}
</script>
<style lang="less" src='../../assets/styles/ideSidebarSection.less'></style>
