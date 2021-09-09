<template>
  <div class="developer-container">
    <div class="developer-content">
      <develop-left-nav
        @action='performAction'
        @refreshAll='reloadEverything'
        @reloadOpenFiles='reloadOpenFiles'
      />
      <editor
        v-if='section !== "dag"'
        @refreshAll='refreshAll'
        @reloadOpenFiles='reloadOpenFiles'
      />
      <dag v-if='section === "dag" && full_dag'/>
      <div class="developer-items">
        <add-item-modal
          v-if='modals.addItem'
          :actionData='modalData.addItem'
          @close='modals.addItem = false'
        />
        <delete-item-modal
          v-if='modals.deleteItem'
          :actionData='modalData.deleteItem'
          @close='modals.deleteItem = false'
        />
      </div>
      <uploader
        v-if='uploader.path && uploader.type'
        :location='uploader.path'
        :type='uploader.type'
        ref='uploader'
      />
    </div>
  </div>
</template>

<script>
import DevelopLeftNav from './DevelopLeftNav';
import Editor from './Editor';
import { mapState } from 'vuex';
import AddItemModal from './FileModals/AddItemModal';
import DeleteItemModal from './FileModals/DeleteItemModal';
import Uploader from '../common/Uploader';
import Dag from './Dag';

export default {
  name: "Develop",
  components : {
    DevelopLeftNav,
    Editor,
    AddItemModal,
    DeleteItemModal,
    Uploader,
    Dag,
  },
  computed: {
    ...mapState('ide', [
      'openFiles',
      'selectedIndex',
      'file_tree',
      'full_dag',
      'activeMainSection',
    ]),
    section() {
      return this.activeMainSection;
    },
  },
  mounted() {
    if (!this.file_tree || !this.file_tree.length) {
      this.reloadEverything();
    }
  },
  data: () => ({
    modals: {
      addItem: false,
      deleteItem: false,
    },
    modalData: {
      addItem: { label: '', location: '', endpoint: '' },
      deleteItem: { location: '' },
    },
    uploader: {
      path: '.',
      type: '',
    },
  }),
  methods : {
    reloadEverything() {
      this.refreshAll();
      this.reloadOpenFiles();
    },
    startChangeBranch() {
      this.$store.dispatch('git/getGitConfig', 'filetree')
      .catch(error => {
          this.$alert({ message: 'Failed to get config', type: 'error' });
          console.log(error);
        })
      this.reloadBranches();
    },
    getBranchStatus(params) {
      this.$store.dispatch('ide/getBranchStatus', params.mode)
      .catch(error => {
          console.log(error);
          this.$alert({message: 'Failed to get branch status', type: 'error'});
        })
    },
    reloadOpenFiles() {
      const files = this.openFiles;
      for (let index in files) {
        const file = files[index];
        this.$store.dispatch('ide/getFileContents', {
          file_name: file.key.substring(1)
        }).then(response => {
          if (response.data.contents != this.openFiles[index].contents) {
            this.$store.dispatch('ide/saveFileContentsByKey', {
              key: `F${response.data.file_name}`,
              contents: response.data.contents
            })
          }
        }).catch(error => console.log(error));
      }
    },
    refreshAll() {
      this.getFileList();
      this.startChangeBranch();
      this.getBranchStatus({
        mode: 'admin',
        variable: 'committing',
        value: true
      })
    },
    reloadBranches() {
      this.$store.dispatch('git/reloadBranches')
        .then(() => this.$store.dispatch('git/toggleReloadingGit', false))
        .catch(error => {
          console.log(error);
          this.$store.dispatch('git/toggleReloadingGit', false);
          this.$alert({message: 'Reload branches failed', type: 'error'});
        })
    },
    getFileList() {
      this.$store.dispatch('ide/getFileList')
        .catch(error => console.log(error));
    },
    performAction(action) {
      const item = action.item;
      switch (action.type) {
        case 'add-file-top':
          this.addItemModal('Top Level', '.', 'addNewFile');
          break;
        case 'add-file':
          this.addItemModal(item.key.substring(2), item.key.substring(2), 'addNewFile');
          break;
        case 'add-directory-top':
          this.addItemModal('Top Level', '.', 'makeDir');
          break;
        case 'add-directory':
          this.addItemModal(item.key.substring(2), item.key.substring(2), 'makeDir');
          break;
        case 'delete-file':
        case 'delete-directory':
          this.deleteItemModal(item);
          break;
        case 'rename-file':
        case 'rename-directory':
          this.renameItem(item);
        break;
        case 'upload-file-top':
          this.handleUploader('.', 'file');
          break;
        case 'upload-directory':
          this.handleUploader(item.key.substring(2), 'directory');
          break;
        case 'upload-file':
          this.handleUploader(item.key.substring(2), 'file');
          break;
      }
    },
    handleUploader(path, type) {
      this.uploader.path = path;
      this.uploader.type = type;
      const uploader = this.$refs.uploader;
      this.$nextTick(() => {
        if (uploader) {
          uploader.$refs.uploadInput.click();
        }
      })
    },
    addItemModal(level, location, endpoint) {
      console.log({level, location, endpoint})
      this.modalData.addItem.label = level;
      this.modalData.addItem.location = location;
      this.modalData.addItem.endpoint = endpoint;
      this.modals.addItem = true;
    },
    deleteItemModal(item) {
      this.modals.deleteItem = true;
      this.modalData.deleteItem.location = item.key.substring(2);
    },
    renameItem(item) {
      const key = item.key;
      const keySplit = key.split('/');

      this.$store.dispatch('ide/renameAbleFile', key);
      this.$store.dispatch('ide/renameValue', keySplit[keySplit.length - 1])
      this.$store.dispatch('ide/getBranchStatus', 'ide');
    },
  },
}
</script>

<style lang='less'>
  .developer-container {
    height: 100%;
    flex: 1;
    .developer-content {
      display: flex;
      justify-content: space-between;
      height: 100%;
    }
  }
</style>
