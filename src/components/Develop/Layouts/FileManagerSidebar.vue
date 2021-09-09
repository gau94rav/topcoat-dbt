<template>
  <div class="file-manager-container overflow-auto" @mouseleave="changesPopover = false">

    <!-- Right click menu -->
    <context-menu
      :options="rightClickOptions[selectedContext]"
      :position="clickedPosition"
      :show="contextMenu"
      :disabled='contextMenuDisabled'
      @close="closedContext"
      @selected="contextAction"
    />
    <!-- Right click menu -->

    <!-- Changes popover, shows all the changes a folder has -->
    <popover
      :show='changesPopover'
      :top='popoverPosition'
      :left='`${parseInt(containerSizes.sidebar.replace("px", "")) + 65}px`'
    >
      <small class="pb-1">
        <div v-for='(change, i) in Object.keys(changes)' :key='i'>
          <div class="d-flex justify-content-between" v-if='changes[change]'>
            <div>{{ change[0].toUpperCase() + change.slice(1) }}: &nbsp;</div>
            <div>{{ changes[change] }}</div>
          </div>
        </div>
      </small>
    </popover>
    <!-- Changes popover, shows all the changes a folder has -->

    <!-- File manager -->
    <multipane ref='fileManagerPane' class="vertical-panes" @paneResizeStop='(...args) => this.$emit("sizeChanged", ...args)'>
      <v-navigation-drawer
        class="navigation-files-drawer"
        :width="containerSizes.sidebar"
        background="#264653"
        permanent
      >
        <!-- File manager head -->
        <div class="position-sticky file-nav-head">
          <v-list-item-title class="list-title top-gap">FILES</v-list-item-title>
          <v-divider class="pb-3"></v-divider>
          <v-list-item class="search-container">
            <search-bar @clear='searchFiles("")' @query='searchFiles' />
          </v-list-item>
          <div class="d-flex folders-section">
            <v-list-item-subtitle class="list-sub-title mt-3 cursor-pointer" @dblclick='closeAllFolders'>Folders</v-list-item-subtitle>
            <div class="d-flex file-bar-controls mt-3">
              <span @click="handleFileManagerMenu">
                <icon-with-loader :loading='false' icon='mdi-plus' />
              </span>
              <icon-with-loader :loading='loading.cloudBuild' icon='mdi-cloud-sync-outline' @clicked='build(true)' class="px-2" />
              <icon-with-loader :loading='loading.build' icon='mdi-reload' @clicked='build' />
            </div>
          </div>
        </div>
        <!-- File manager head -->

        <!-- File manager body -->
        <v-treeview
          v-if='fileTreeItems && fileTreeItems.length'
          :items="fileTreeItems"
          open-on-click
          item-key="key"
          ref='fileTree'
          :open.sync='opened'
        >
          <template v-slot:append="{ item }">

            <!-- Show file or folder changes -->
            <v-icon
              @mouseenter="getChanges($event, item)"
              v-if='item.type === "folder" && hasAnyChange(item)'
              class="default-icon-size"
              color='rgba(172, 172, 172, 0.65)'>
              mdi-circle-medium
            </v-icon>
            <!-- Show file or folder changes -->

            <!-- Shwo add ref button -->
            <div v-else>
              <v-icon
                style='padding: 2px'
                class="square-btn ref-add-btn ml-3"
                @click='addRef($event, item)'
                v-if='showAddRefButton(item)'
              >
                mdi-code-braces
              </v-icon>
            </div>
          </template>
          <!-- Shwo add ref button -->

          <!-- Item icon (folder/file) -->
          <template v-slot:prepend="{ item, open }">
            <div @click="processSelected(item)">
              <v-icon
                class="nav-file"
                :class="{ 'faded-text': item.key.includes('dbt_gen') || item.key.includes('modules') }"
                :style='{ color: hasAnyChange(item) ? "#e9c46a" : "" }'
              >
                {{ getIcon(item, open) }}
              </v-icon>
            </div>
          </template>
          <!-- Item icon (folder/file) -->

          <!-- Item label & inline rename -->
          <template #label="{ item }">

            <!-- Label -->
            <div
              v-if='item.key != renameKey'
              class="file-name"
              @contextmenu="handleRightClick($event, item)"
              :class="{ 'faded-text': item.key.includes('dbt_gen') || item.key.includes('modules') }"
              :title='item.key.substring(2)'
            >
              <v-icon v-if='item.loading' class="spinner-loader">mdi-loading</v-icon>
              <span v-else @click="processSelected(item)">{{ item.title }}</span>
              <div v-if='openFiles.length && highlightedFile === item.key' class='highlighted-file'></div>
            </div>
            <!-- Label -->

            <!-- Rename Input -->
            <div v-else>
              <span v-if='item.key === renameKey && renamingProcess'>
                <v-icon class="spinner-loader">mdi-loading</v-icon>
              </span>
              <div class="d-flex input-icon-group" v-else>
                <input
                  ref='renameInput'
                  class='rename-input'
                  @keyup="triggerRename"
                  outlined
                  v-model="value"
                />
                <v-icon @click="cancelRename">mdi-close</v-icon>
              </div>
            </div>
            <!-- Rename Input -->

          </template>
          <!-- Item label & inline rename -->

        </v-treeview>
        <!-- File manager body -->

        <small v-else>No files found</small>
      </v-navigation-drawer>
      <multipane-resizer class="desktop-element"></multipane-resizer>
    </multipane>
    <!-- File manager -->

  </div>
</template>

<script>
import "../../../assets/folderYellow.svg";

import ContextMenu from "../../common/ContextMenu";
import IconWithLoader from "../Layouts/IconWithLoader";
import { Multipane, MultipaneResizer } from 'vue-multipane';
import {
  FoldersContextMenu,
  FilesContextMenu,
  FileManagerMenu,
} from "../../../assets/constants/menus";
import { mapState } from "vuex";
import SearchBar from '../../common/SearchBar';
import { eventBus } from '../../../main';
import Popover from '../../common/Popover';

export default {
  data: () => ({
    rightClickOptions: {
      folder: FoldersContextMenu,
      file: FilesContextMenu,
      manager: FileManagerMenu,
    },
    contextMenu: false,
    selectedContext: "",
    selectedItem: null,
    clickedPosition: { x: 0, y: 0 },
    loading: {
      build: false,
      cloudBuild: false,
    },
    fileQuery: '',
    contextMenuDisabled: false,
    tree: [],
    changesPopover: false,
    popoverPosition: 0,
    changes: { added: 0, renamed: 0, deleted: 0, modified: 0 }
  }),
  components: {
    ContextMenu,
    IconWithLoader,
    SearchBar,
    Multipane,
    MultipaneResizer,
    Popover,
  },
  computed: {
    sideBarIcons: function () {
      return {
        folder: static_url + "folderYellow.svg",
      };
    },
    value: {
      get() {
        return this.renameValue;
      },
      set(val) {
        this.$store.dispatch('ide/renameValue', val);
        return val;
      }
    },
    ...mapState("ide", [
      "file_tree",
      "openFiles",
      "modified",
      "added",
      "selectedIndex",
      "conflicts",
      "renamed",
      "deleted",
      "expandedList",
      "selectedFileKey",
      "renameKey",
      "renameValue",
      "renamingProcess",
      "openFolderIds",
      "all_files",
      "highlightedFile",
      "openedFolders",
      "containerSizes",
      "searchQuery",
    ]),
    opened: {
      get() {
        return this.openedFolders;
      },
      set(ids) {
        this.$store.dispatch('ide/updateOpenedFolders', ids);
      }
    },
    fileTreeItems() {
      if (this.file_tree) {
        this.openFileFromUrl();
      }
      return this.file_tree;
    }
  },
  methods: {
    getChanges(e, item) {
      this.changesPopover = true;
      this.popoverPosition = (e.clientY - 20) + 'px';

      this.changes.added = this.isAdded(item, true);
      this.changes.modified = this.hasChanges(item);
      this.changes.renamed = this.hasRenamedItems(item.key, true);
      this.changes.deleted = this.hasDeleteItems(item.key, true);
    },
    hasAnyChange(item) {
      return this.isAdded(item) ||
        this.hasChanges(item) ||
        this.hasRenamedItems(item.key) ||
        this.hasDeleteItems(item.key);
    },
    openFileFromUrl() {
      try {
        const urlFileKey = window.location.pathname;
        let key = urlFileKey
          .slice(urlFileKey.indexOf('develop') + 8)
          .replace('|', '.') //Firefox
          .replace('%7C', '.'); //Chrome

        if (!key) return false;
        key = 'F/' + key;
        const file = this.$objExtract(this.file_tree, 'key', key, 'children');
        if (file && file.key) {
          this.processSelected(file, true);
        }
      } catch (error) {
        console.error(error);
      }
    },
    hasChanges(item) {
      if (item.type === 'folder') {
        return item.children.filter(c => {
          return c.changes ||
            this.modified.indexOf(c.key.substring(2)) > -1 ||
            this.modified.filter(m => m.includes(c.key.substring(2))).length;
        }).length;
      } else {
        return this.modified.filter(m => m.includes(item.key.substring(2))).length;
      }
    },
    hasConflicts(key, open, type = 'folder') {
      if (type === 'folder') {
          for (let i in this.conflicts) {
            if (this.conflicts[i].replace('"','').startsWith(key.substring(2))) {
              return !open ? 'mdi-folder-information' : 'mdi-folder-open';
            }
          }
      } else {
        if (this.conflicts.includes(key.substring(2)) || this.conflicts.includes('"' + key.substring(2) + '"')) {
          return 'mdi-file-alert-outline';
        }
      }
      return false;
    },
    hasDeleteItems(key, itemCount = false) {
      let count = 0;
      for (let deleted of this.deleted) {
        if (deleted.includes(`${key.substring(2)}/`)) {
          if (itemCount) {
            count += 1;
          } else {
            return true;
          }
        }
      }
      if (itemCount) {
        return count;
      }
      return false;
    },
    hasRenamedItems(key, itemCount = false) {
      let count = 0;
      for (let renamed of this.renamed) {
        if (renamed.includes(`${key.substring(2)}/`)) {
          if (itemCount) {
            count += 1;
          } else {
            return true;
          }
        }
      }
      if (itemCount) {
        return count;
      }
      return false;
    },
    getIcon(item, open) {
      const key = item.key;
      if (item.cloud) {
        return 'mdi-weather-cloudy';
      }
      if (item.type === 'folder') {

        const conflictIcon = this.hasConflicts(key, open);
        const hasChanges = this.hasChanges(item);
        const hasDeletedItems = this.hasDeleteItems(key);
        const hasRenamedItems = this.hasRenamedItems(key);
        const hasAddedItems = this.isAdded(item);

        if (conflictIcon) return conflictIcon;
        else if (hasChanges || hasDeletedItems || hasRenamedItems || hasAddedItems) {
          return open ? 'mdi-folder-open' : 'mdi-folder';
        }
        return open ? 'mdi-folder-open-outline' : 'mdi-folder-outline';
      } else {
        const hasChanges = item.changes || this.hasChanges(item);
        const hasConflicts = this.hasConflicts(key, open, 'file');
        const isAdded = this.isAdded(item);
        if (isAdded) return 'mdi-file-plus';
        if (hasChanges) return 'mdi-file-edit';
        if (hasConflicts) return 'mdi-file-alert';
      }
      return 'mdi-file-outline';
    },
    isAdded(item, itemCount = false) {
      if (item.cloud) return false;
      const key = item.key;

      if (item.type === 'file') {
        for (let addedKey of this.added) {
          if (addedKey.replace(/[\""]/g, '') === key.substring(2)) {
            return true;
          }
        }
        return false;
        return this.added.includes(key.substring(2));
      } else {
        let count = 0;
        for (let a of this.added) {
          if (a.includes(key.substring(2))) {
            count += 1;
          }
        }
        return count;
      }
    },
    closedContext() {
      this.contextMenu = false;
    },
    resetContextMenu() {
      this.rightClickOptions['folder'] = FoldersContextMenu;
      this.rightClickOptions['file'] = FilesContextMenu;
      this.rightClickOptions['manager'] = FileManagerMenu;
    },
    processSelected(file, skipUrl = false) {
      const isDirectory = file.type === 'folder';
      this.$store.dispatch('ide/highlightedTreeFile', '');
      if (!isDirectory) {
        if (!skipUrl) {
          this.$removeQueryFromUrl();
        }
        this.$store.dispatch('ide/loadFile', {
          file,
          instance: this,
          selectTab: `tab-${file.key}`,
        });
        if (!skipUrl && file.key) {
          this.$addKeyToUrl(file.key);
        }
      }
    },
    handleRightClick(e, item) {
      this.resetContextMenu();
      e.preventDefault();
      this.showMenu = false;

      this.clickedPosition.x = e.clientX;
      this.clickedPosition.y = e.clientY;
      
      const key = item.key;
      if (key.includes('/dbt_gen') || key.includes('/modules')) return false;
      const type = item.type;
      const label = item.title;

      this.contextMenuDisabled = false;
      this.selectedItem = item;

      this.$nextTick(() => {
        this.rightClickOptions[type] = this.rightClickOptions[type].map((i) => {
          const labelText = i.label.replace("[name]", label);
          return {
            label: labelText,
            action: i.action,
            icon: i.icon,
          };
        });
        if (type === 'file') {
          const isOpened = this.openFiles.filter(f => f.key === item.key).length;
          this.contextMenuDisabled = isOpened > 0 || this.renameKey !== '';
        } else if (type === 'folder') {
          this.contextMenuDisabled = this.renameKey !== '';
        }
        this.selectedContext = type;
        this.contextMenu = true;
      });
    },
    handleFileManagerMenu(e) {
      this.selectedContext = "manager";
      this.clickedPosition.x = e.clientX;
      this.clickedPosition.y = e.clientY;
      this.selectedItem = null;
      this.contextMenu = true;
    },
    build(cloudBuild = false) {
      this.loading.build = !cloudBuild;
      this.loading.cloudBuild = cloudBuild;
      const $this = this;
      this.$store.dispatch('ide/build', {
        update_modules: cloudBuild,
        reset: true,
      }).then(() => {
            this.$store.dispatch('ide/getDag')
              .then(() => {
                $this.loading.build = false;
                $this.loading.cloudBuild = false;
                this.$emit('refresh');
              }).catch(error => {
                console.error(error);
                $this.loading.build = false;
                $this.loading.cloudBuild = false;
              });
        }).catch(error => {
          console.log(error);
          this.$alert({
            message: 'Failed to build',
            type: 'error',
          })
          $this.loading.build = false;
          $this.loading.cloudBuild = false;
        })
    },
    searchFiles(val) {
      if (!val) {
        this.opened = [];
        return this.$store.dispatch('ide/updateFileTree', this.all_files);
      }
      val = val.toLowerCase();
      this.$store.dispatch('ide/filterFiles', {
        query: val,
        all_files: this.all_files
      });
    },
    triggerRename(event) {
      const key = event.key;
      this.$store.dispatch('ide/renameValue', this.value);
      if (key === 'Enter') this.renameSelectedItem();
      if (key === 'Escape') this.cancelRename();
    },
    renameSelectedItem() {
      let { renameKey, renameValue } = this;
      let value = renameKey.split('/');

      value[value.length - 1] = renameValue;
      value = value.join('/');

      this.$store.dispatch('ide/renamingProcess', true);
      this.$store.dispatch('ide/renamePath', {
        old_path: renameKey.substring(2),
        new_path: value.substring(2),
      }).then(() => {
        this.$store.dispatch('ide/renamingProcess', false);
        this.$store.dispatch('ide/getFileList');
      }).catch(error => {
        console.log(error);
        this.$store.dispatch('ide/renamingProcess', false);
      });
    },
    cancelRename() {
      this.$store.dispatch('ide/cancelRename');
    },
    contextAction(type) {
      this.$emit('action', {type, item: this.selectedItem});
      this.$nextTick(() => {
        const input = this.$refs.renameInput;
        if (input) {
          input.setSelectionRange(0, 0);
          input.focus();
        }
      })
    },
    addRef(event, item) {
      const key = item.key;
      event.stopPropagation();
      const keySplit = key.replace('.sql','').split('/')
      eventBus.$emit("cm_add_text", "{{ ref('" + keySplit[keySplit.length-1] + "') }}");
    },
    closeAllFolders() {
      this.opened = [];
    },
    showAddRefButton(item) {
      const file = this.openFiles[this.selectedIndex];
      if (file === 'undefined') return false;
      return this.openFiles.length &&
        file &&
        file.key !== item.key && 
        this.$getLanguage(file.key) === "sql" &&
        item.type === "file" &&
        this.$getLanguage(item.key) === "sql"
    }
  },
};
</script>

<style lang="less" src='../../../assets/styles/ideSidebarSection.less'></style>