<template>
  <div class="code-editor-container">
    <v-card elevation="0" class="editor-area pb-10">
      <editor-tabs @handleCommitClick='handleCommitClick' />
      <multipane layout='horizontal' @paneResize='setContainerHeight'>
        <div
          ref='outerPane'
          class="lower-section"
          :style='{
            height: (sqlArea && sqlFile) ? containerSizes.textEditorHeight : "calc(100vh - 250px)",
          }'>
            <multipane
              class="vertical-panes"
              :style='{width: "100%", height: (sqlArea && sqlFile) ? containerSizes.textEditorHeight : "calc(100% - 70px)"}'
              @paneResize='setContainerWidth'
            >
              <text-editor
                :style='{
                  width: (buildErrorsSection || quickHelp) ? containerSizes.textEditor : "100%",
                  height: (sqlArea && sqlFile) ? containerSizes.textEditorHeight : "calc(100% - 70px)",
                  minHeight: (sqlArea && sqlFile) ? containerSizes.textEditorHeight : "calc(100% - 70px)",
                  maxHeight: (sqlArea && sqlFile) ? containerSizes.textEditorHeight : "calc(100% - 70px)",
                }'
                class="text-area"
                ref="textArea"
                @executeQuery="executeQuery"
              />
            <multipane-resizer v-if='buildErrorsSection || quickHelp'></multipane-resizer>
            <transition name='slide-fade-right'>
              <div
                v-if='buildErrorsSection || quickHelp'
                :style='{
                  width: containerSizes.textEditor.includes("calc") ? "350px" : (100 - parseInt(containerSizes.textEditor.replace("%", ""))) + "%",
                  minWidth: "350px"
                }'
                class="text-editor-sidebar"
              >
                <errors-section
                  class="errors-section outline"
                  :style='{height: (sqlArea && sqlFile) ? containerSizes.textEditorHeight : "calc(100vh - 130px)"}'
                  v-if="buildErrorsSection"
                />
                <quick-help
                  :style='{height: (sqlArea && sqlFile) ? containerSizes.textEditorHeight : "calc(100vh - 130px)"}'
                  v-if='quickHelp'
                />
              </div>
            </transition>
          </multipane>
        </div>
        <multipane-resizer v-if='(sqlArea && sqlFile)'></multipane-resizer>
        <transition name='slide-fade-bottom'>
          <sql-panel
            v-if="(sqlArea && sqlFile)"
            class="sql-panel-area"
            @executeQuery="executeQuery(true)"
          />
        </transition>
      </multipane>
    </v-card>
    <commit-modal
      v-if='commitModal'
      :show='commitModal'
      @close='commitModal = false'
      @refreshAll='$emit("refreshAll")'
    />
  </div>
</template>

<script>
import EditorTabs from "./Layouts/EditorTabs";
import ErrorsSection from "./ErrorsSection";
import SqlPanel from "./SqlPanel";
import { mapState } from "vuex";
import TextEditor from "./TextEditor";
import CommitModal from './CommitModal';
import { Multipane, MultipaneResizer } from 'vue-multipane';
import QuickHelp from './QuickHelp';

export default {
  data: () => ({
    commitModal: false,
  }),
  components: {
    EditorTabs,
    ErrorsSection,
    SqlPanel,
    TextEditor,
    CommitModal,
    Multipane,
    MultipaneResizer,
    QuickHelp,
  },
  computed: {
    ...mapState("ide", [
      "openFiles",
      "selectedIndex",
      "commits_behind",
      "commits_ahead",
      "sqlSection",
      "containerSizes",
      "quickHelp",
      "all_files",
      "executingQuery",
      "reloadingQuery",
      "loadingFile",
      "buildErrorsSection",
    ]),
    sqlArea: {
      get() {
        if (this.sqlSection) {
          this.sqlActivated();
        }
        return this.sqlSection;
      },
      set(toggle) {
        this.$store.dispatch('ide/toggleSqlSection', toggle);
        return toggle;
      }
    },
    sqlFile() {
      const file = this.openFiles[this.selectedIndex];
		  return file && this.$getLanguage(file.key) === 'sql';
    },
    executing: {
      get() {
        return this.executingQuery;
      },
      set(value) {
        this.$store.dispatch('ide/toggleQueryExecution', value);
      }
    },
    executingReload: {
      get() {
        return this.reloadingQuery;
      },
      set(value) {
        this.$store.dispatch('ide/toggleQueryReload', value);
      }
    }
  },
  methods: {
    executeQuery(reload = false) {
      const file = this.openFiles[this.selectedIndex];
      const request = {
        sql: file.contents,
        path: file.key.replace("F/layers/", ""),
        filters: file.filter_overrides,
        attributes: file.attribute_overrides,
        origin: window.location.origin,
      };
      this.executing = !reload;
      this.executingReload = reload;
      this.$store.dispatch("ide/runQuery", request).then(
        (response) => {
          this.handleQueryResponse(response, file);
          this.executing = false;
          this.executingReload = false;
          this.$store.dispatch('ide/toggleSqlSection', true);
          this.$store.dispatch('ide/activeTab', 'tab-results');
        },
        (error) => {
          console.log(error);
          this.handleErrorResponse(file);
          this.executing = false;
          this.executingReload = false;
          this.$store.dispatch('ide/toggleSqlSection', true);
          this.$store.dispatch('ide/activeTab', 'tab-results');
        }
      );
    },
    handleQueryResponse(response, file) {
      this.updateAttribute(file.key, "queryResults", response.data.results);
      this.updateAttribute(file.key, "queryCount", response.data.count);
      this.updateAttribute(
        file.key,
        "rendered_sql",
        response.data.rendered_sql
      );
      this.updateAttribute(
        file.key,
        "visualization",
        response.data.visualization
      );
      this.$store.dispatch("ide/updateDag", {
        layer_dags: {},
        [this.currentLayer]: {
          nodes: response.data.nodes,
          edges: response.data.edges,
        },
      });
      if (response.data.success) {
        this.updateAttribute(file.key, "queryErrors", []);
        this.updateAttribute(
          file.key,
          "emptySuccess",
          response.data.count ? false : true
        );
      } else if (response.data.status == "error") {
        this.updateAttribute(file.key, "queryErrors", response.data.errors);
        this.updateAttribute(file.key, "activeResultsTab", "results");
        this.updateAttribute(file.key, "emptySuccess", false);
      }
    },
    handleErrorResponse(file) {
      this.updateAttribute(file.key, "queryResults", null);
      this.updateAttribute(file.key, "queryCount", null);
      this.updateAttribute(file.key, "nodes", null);
      this.updateAttribute(file.key, "edges", null);
    },
    updateAttribute(key, attribute, value) {
      this.$store.dispatch("ide/openFileAtrribute", {
        key,
        attribute,
        value,
      });
    },
    handleCommitClick(changeCount) {
      if (changeCount > 0) {
        this.getBranchStatus();
      } else if (this.commits_behind) {
        this.pullOriginBranch();
      } else if (this.commits_ahead) {
        this.deployUserBranch();
      }
    },
    getBranchStatus() {
      this.$store.dispatch('ide/toggleCommitLoading', true);
      this.$store.dispatch('ide/getBranchStatus')
        .then(() => {
          this.commitModal = true;
          this.$store.dispatch('ide/toggleCommitLoading', false);
        }).catch(error => {
          console.log(error);
          this.$store.dispatch('ide/toggleCommitLoading', false);
        });
    },
    pullOriginBranch() {
      this.$store.dispatch('ide/toggleCommitLoading', true);
      this.$store.dispatch('git/pullOriginBranch')
        .then(() => {
          this.$store.dispatch('ide/toggleCommitLoading', false);
          this.$emit('refreshAll');
          this.$emit('reloadOpenFiles');
        }).catch(error => {
          this.$store.dispatch('ide/toggleCommitLoading', false);
          console.log(error);
        })
    },
    deployUserBranch() {
      this.$store.dispatch('ide/toggleCommitLoading', true);
      this.$store.dispatch('git/deployUserBranch')
        .then(() => {
          this.$store.dispatch('ide/toggleCommitLoading', false);
          this.$emit('refreshAll');
        }).catch(error => {
          console.log(error);
          this.$store.dispatch('ide/toggleCommitLoading', false);
          this.$emit('refreshAll');
        })
    },
    setContainerWidth(pane, container, size) {
      this.$store.dispatch('ide/addContainerSize', {
        container: 'textEditor',
        size: pane.style.width
      });
    },
    setContainerHeight(pane, container, size) {
      if (size.includes('%')) {
        size = this.containerSizes.textEditorHeight;
      }
      const sizeNumber = parseInt(size.replace('px', ''));

      if (sizeNumber >= this.containerSizes.maxOuterPaneHeight || sizeNumber <= 65) {
        size = this.containerSizes.textEditorHeight;
      }
      pane.style.height = size;
      this.$store.dispatch('ide/addContainerSize', {
        container: 'textEditorHeight',
        size
      })
      this.setSqlHeight();
    },
    setSqlHeight() {
      let { maxOuterPaneHeight, textEditorHeight } = this.containerSizes;
      let size = '300px';
      if (maxOuterPaneHeight && textEditorHeight) {
          if (textEditorHeight.includes('px') && !textEditorHeight.includes('calc')) {
            textEditorHeight = parseInt(textEditorHeight.replace('px', ''));
            size = (300 + maxOuterPaneHeight - textEditorHeight) + 'px';
          }
      }
      this.$store.dispatch('ide/addContainerSize', {
        container: 'sqlHeight',
        size
      })
      return size;
    },
    sqlActivated() {
      if (this.containerSizes.maxOuterPaneHeight) return false;
      const element = this.$refs.outerPane;
      if (element) {
        this.$store.dispatch('ide/addContainerSize', {
          container: 'maxOuterPaneHeight',
          size: element.clientHeight
        });
      }
    }
  },
};
</script>

<style lang="less">
.code-editor-container {
  width: 100%;
  .editor-area {
    border-radius: 0px;
    display: flex;
    flex-direction: column;
    height: 100vh;
    .lower-section {
      display: flex;
      .errors-section {
        height: calc(100% - 70px);
        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;
        border-left: none;
      }
    }
    .sql-panel-area {
      // flex: 1;
    }
  }
}
@media (max-width: 1024px) {
  .text-editor-sidebar {
    width: 100% !important;
    position: absolute !important;
    left: 0;
    background: #fff;
    z-index: 40;
  }
}
</style>