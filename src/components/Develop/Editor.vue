<template>
  <div class="editor-container">
    <div class="editor-content pb-16">
      <transition name='fade'>
        <div v-if='sidebarVisible' @click='hideSidebar' class="mobile-element shadow-background"></div>
      </transition>
      <div class="editor-logo-container mx-3" v-if="!openedTabs.length">
        <div class="editor-main-logo">
          <img :src="editorIcons.files_open" class="no-files-logo" />
          <div class="editor-logo-text text-center pt-5">No Open Files</div>
        </div>
      </div>
      <div v-else class="d-flex justify-space-between">
        <code-section
          @refreshAll='$emit("refreshAll")'
          @reloadOpenFiles='$emit("reloadOpenFiles")'
        />
      </div>
    </div>
  </div>
</template>

<style lang="less">
.editor-container {
  width: 100%;
  overflow: hidden;
  transition: 0.3s;
  .editor-content {
		width: 97%;
		position: relative;
		right: 0;
		left: 0;
		margin: auto;
		top: 15px;
		height: 100%;
    .edit-section {
      width: 100%;
    }
    .editor-header {
      display: flex;
      justify-content: space-between;
    }
    .editor-logo-container {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      .editor-main-logo {
        .editor-logo-text {
          color: #6b7280;
          font-size: 12px;
        }
      }
    }
  }
}

@media (max-width: 1024px) {
  .editor-content {
    margin: 0 7px !important;
  }
}
</style>

<script>
import "../../assets/files_open.svg";
import CodeMirror from "codemirror";
import CodeSection from "./CodeSection";
import { mapState } from 'vuex';

export default {
  components: { CodeMirror, CodeSection },
  computed: {
    editorIcons: function () {
      return {
        files_open: static_url + "files_open.svg",
      };
    },
    ...mapState('ide', [
      'openedTabs',
      'sidebarVisible',
    ])
  },
  methods: {
    hideSidebar() {
      this.$store.dispatch('ide/toggleSidebar', false);
    }
  }
};
</script>