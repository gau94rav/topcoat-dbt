<template>
  <v-icon class="spinner-loader centered-element-absolute" v-if='!initialized'>mdi-loading</v-icon>
  <v-layout column v-else>
    <div class="dbt-head">
      <div class="main-title-admin">dbt Connector</div>
      <confirm-popup
        :disabled='loading || !dbt_enabled || resyncing || saving'
				icon='mdi-alert-outline'
        message='Reset the DBT Connector? This cannot be undone.'
        title='Reset DBT Connector'
        color='#e76f51'
        :loading='resetting'
				customClass='reset-git-btn'
        @confirm='resetDbt' />
    </div>
    <div class="dbt-body">
      <div class="spacer-div my-5"></div>
      <div class="main-subtitle-admin">dbt Repo URL:</div>
      <div class="main-text-admin git-text pt-1 pb-5" v-if='dbt_enabled'>{{ remote_url }}</div>
      <!-- Git configure input -->
      <v-text-field
        :disabled="loading"
        v-if="!dbt_enabled && initialized"
        outlined
        dense
        class="git-repo-input pt-2 pb-5"
        v-model="git_url"
        width='248px'
        placeholder="git@github.com:ORGANIZATION/REPOSITORY.git"
      ></v-text-field>
      <!-- Git configure input -->
      <div class="d-flex justify-space-between">
        <div class="main-subtitle-admin">Deploy Key:</div>
        <v-icon class="git-icon outline cursor-pointer" @click="copyToClipboard">mdi-content-copy</v-icon>
      </div>

      <div ref="sshKey" class="git-text pt-3 pb-5 main-text-admin">{{ deploy_key }}</div>

      <!-- INput -->
      <div class="dbt-lower-controls">
        <div class="dbt-input">
          <div class="form-group" v-if="dbt_enabled">
            <label class="main-subtitle-admin">Branch</label>
            <v-select
              :disabled="saving || resyncing"
              :items="branches || []"
              v-model="tmp_branch"
              @input='changes = true'
              class="form-item pt-2 pb-5"
              dense
              outlined
            ></v-select>
          </div>
          <div class="form-group pl-2" v-if="dbt_enabled">
            <label class="main-subtitle-admin">Target</label>
            <v-text-field
              :disabled="saving || resyncing"
              outlined
              dense
              class="form-item pt-2 pb-5"
              @input='changes = true'
              v-model="tmp_target"
            ></v-text-field>
          </div>
        </div>

        <div v-if="error_message" class="error-message d-flex justify-space-start mt-5">
          <v-icon>mdi-alert</v-icon>
          <div class="pl-3">{{ error_message }}</div>
        </div>

        <div class="dbt-buttons pt-5">
          <v-btn
            elevation="0"
            color="#2a9d8f"
            class="save-button"
            height="36px"
            @click="saveChanges"
            v-if="dbt_enabled"
            :disabled="!changes || saving || resyncing"
          >
            <span>Save</span>
            <v-icon class="standard-icon-size ml-1" :class="{'spinner-loader': saving}">
              {{ !saving ? 'mdi-content-save-outline' : 'mdi-loading' }}
            </v-icon>
          </v-btn>
          <v-btn
            elevation="0"
            class="resync-button ml-4"
            color='2a9d8f'
            height="36px"
            :disabled="resyncing || saving"
            @click="resync"
            v-if="dbt_enabled"
          >
            <span>Resync</span>
            <v-icon class="standard-icon-size ml-1" :class="{'spinner-loader': resyncing}">
              {{ !resyncing ? 'mdi-reload' : 'mdi-loading' }}
            </v-icon>
          </v-btn>

          <!-- Configure button -->

          <v-btn
            elevation="0"
            color="#2a9d8f"
            height="36px"
            class="save-button"
            :disabled="notValidGitUrl || resyncing || saving"
            @click="configureDbt"
            v-if="!dbt_enabled && initialized"
          >
            <div>Configure</div>
            <v-icon
              :class='{"spinner-loader": saving}'
              class="ml-2 standard-icon-size">
              mdi-cog
            </v-icon>
          </v-btn>
          <!-- Configure button -->

        </div>
      </div>
    </div>
  </v-layout>
</template>

<script>
import { mapState } from "vuex";
import "../../assets/save.svg";
import "../../assets/reload-green.svg";
import ConfirmPopup from '../common/ConfirmPopup';

export default {
  name: "Dbt",
  components: {
    ConfirmPopup,
  },
  data() {
    return {
      step: 0,
      setupVisible: false,
      git_url: "",
      error_message: null,
      ssh_key: null,
      loading: false,
      settings_changed: false,
      initialized: false,
      changes: false,
      tmp_branch: null,
      tmp_target: null,
      resyncing: false,
      saving: false,
      resetting: false,
    };
  },
  methods: {
    copyToClipboard() {
      const html = this.$refs.sshKey;
      if (html) {
        const textarea = document.createElement('textarea');
        textarea.id = 'copy-area';
        document.body.appendChild(textarea);
        const copyElement = document.getElementById('copy-area');
        copyElement.value = html.innerText;
        copyElement.select();
      }
			document.execCommand('copy');
			this.$alert({message: 'Deploy key copied to clipboard', type: 'success'})
    },
    confirmPopup(e, message) {
      console.log(e);
    },
    changeBranch() {
      this.changes = true;
    },
    changeTarget() {
      this.changes = true;
    },
    saveChanges() {
      var request = {
        branch: this.tmp_branch,
        target: this.tmp_target,
      };

      this.saving = true;
      this.$store.dispatch('dbt/updateDbt', request)
        .then(() => this.getDbtConfig())
        .catch(error => {
          console.log(error);
          this.saving = false;
          this.error_message = error.response.data.message;
        })
    },
    resync() {
      this.resyncing = true;
      this.$store.dispatch('dbt/resyncDbt')
        .then(() => this.getDbtConfig())
        .catch(error => {
          this.resyncing = false;
          console.log(error);
          this.error_message = error.response.data.message;
        })
    },
    resetVars() {
      this.ssh_key = null;
      this.error_message = null;
      this.git_url = "";
      this.step = 0;
    },
    resetDbt() {
      this.resetVars();
      this.resetting = true;
      this.$store.dispatch('dbt/resetDbt')
        .then(() => this.getDbtConfig())
        .catch(error => {
          console.log(error);
          this.setupVisible = false;
        });
    },
    updateState(response) {
      this.$store.dispatch('dbt/updateStates', response.data);
      this.error_message = response.data.message;
      this.tmp_target = response.data.target;
      this.tmp_branch = response.data.current_branch;
    },
    configureDbt() {
      var request = {
        remote_url: this.git_url,
      };

      this.saving = true;
      this.$store.dispatch('dbt/cloneDbt', request)
        .then(() => this.getDbtConfig())
        .catch(error => {
          this.saving = false;
          this.resetting = false;
          this.resyncing = false;
          this.error_message = error.response.data.message;
          console.log(error);
        })
    },
    getDbtConfig() {
      this.$store.dispatch('dbt/getDbtConfig')
      .then(response => {
        this.updateState(response);
        this.initialized = true;
        this.tmp_branch = response.data.current_branch || '';
        this.loading = false;
        this.resyncing = false;
        this.resetting = false;
        this.saving = false;
        this.error_message = null;
        this.changes = false;
        this.error_message = null;
      })
      .catch(error => {
        console.log(error);
      })
    },
  },
  computed: {
    ...mapState("dbt", [
      "git_configured",
      "remote_url",
      "dbt_enabled",
      "deploy_key",
      "target",
      "branches",
      "current_branch",
    ]),
    icons() {
      return {
        save: static_url + "save.svg",
        reload: static_url + "reload-green.svg",
      };
    },
    notValidGitUrl() {
      if (
        this.git_url.includes("git") &&
        this.git_url.includes("@") &&
        this.git_url.includes(":") &&
        this.git_url.includes(".git")
      )
        return false;
      else return true;
    },
  },
  created() {
    this.loading = true;
    this.getDbtConfig();
    this.$store.dispatch('admin/adminSection', '/admin/dbt');
  },
};
</script>

<style lang='less'>
.option_label {
  font-weight: bold;
  font-size: 10px;
  padding-bottom: 3px;
}
.v-application--wrap {
  .dbt-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    .v-toolbar__title {
      font-family: "Montserrat-Medium";
      font-size: 18px !important;
    }
    .v-btn {
      color: #fff;
      text-transform: none;
    }
  }
  .url-title {
    font-size: 16px !important;
    font-family: "Montserrat-Medium";
  }
  .git-repo-input {
    width: 560px;
    font-size: 12px;
  }
  .dbt-lower-controls {
    .dbt-input {
      display: flex;
      .form-group {
        label {
          font-family: "Montserrat-Medium";
          color: #272727;
          font-size: 12px;
        }
        .form-item {
          width: 248px;
          font-family: "Montserrat-Light";
          outline: none !important;
        }
      }
    }
    .dbt-buttons {
      .v-btn {
        text-transform: none;
        // height: 44.3px;
        // width: 120.3px;
        font-family: "Roboto-Medium";
      }
      .save-button {
        color: #fff;
      }
      .resync-button {
        color: #2a9d8f !important;
        background: rgba(42, 157, 143, 0.08) !important;
      }
    }
  }
}
</style>
