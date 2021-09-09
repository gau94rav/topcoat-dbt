<template>
	<v-icon class="spinner-loader centered-element-absolute" v-if='!initialized'>mdi-loading</v-icon>
	<v-layout column v-else>
		<div class="main-title-admin">Development Mode</div>
		<div class="spacer-div my-5"></div>
		<div v-if='initialized'>
			<div class="mt-1 mode-action d-flex justify-space-between" v-if='configured'>
				<div
					class="action px-1 cursor-pointer right-no-border"
					:style='{opacity: loading ? "0.5" : "1"}'
					:class="dev_enabled_tmp ? 'action-active' : 'action-inactive'"
					@click='toggleDevSwitch(true)'>
					Enabled
				</div>
				<div
					class="action px-1 cursor-pointer left-no-border"
					:style='{opacity: loading ? "0.5" : "1"}'
					:class="!dev_enabled_tmp ? 'action-active' : 'action-inactive'"
					@click='toggleDevSwitch(false)'>
					Disabled
				</div>
			</div>
			<div class="mt-5">Branch: </div>
			<div v-if='!dev_enabled'>
				<div class="d-flex form-group">
					<v-select
						:disabled="!dev_enabled_tmp || loading"
						:items="branches || []"
						v-model="current_branch_tmp"
						outlined
						dense
						class="form-item pt-2 pb-5"
						width='248px'
					></v-select>
					<v-icon @click="reloadBranches" v-if='!reloading' :class="{'spinner-loader': reloading}" class="reload-icon standard-icon-size">mdi-reload</v-icon>
					<v-icon class="reload-icon spinner-loader standard-icon-size" v-else>mdi-loading</v-icon>
				</div>
			</div>
			<div class="branch-text" v-else>{{ current_branch }}</div>
			<v-btn
				elevation="0"
				class="mt-16"
				color="#2a9d8f"
				:disabled="!settings_changed || loading"
				@click="saveDevSettings"
			>
				<span class="d-flex">
					<div class="d-flex align-self-center">Save</div>
					<v-icon class="ml-2 standard-icon-size" :class="{'spinner-loader': loading}">mdi-{{ loading ? 'loading' : 'content-save-outline' }}</v-icon>
				</span>
			</v-btn>
			<div v-if="error_message" class="mt-5 error-message">
				<v-icon>mdi-alert-circle</v-icon>{{ error_message }}
			</div>
		</div>
	</v-layout>
</template>

<script>

import { mapState } from 'vuex';

export default {
    name: "Git",
    data() {
    	return {
    		step: 0,
    		setupVisible: false,
    		error_message: '',
    		current_branch_tmp: null,
    		ssh_key: null,
    		loading: false,
			reloading: false,
    		configure_loading: false,
    		dev_enabled_tmp: false,
    		settings_changed: false,
    		initialized: false
    	}
    },
    methods: {
		toggleDevSwitch(toggle) {
			if (this.loading) return false;
			this.dev_enabled_tmp = toggle;
			this.checkChanged();
		},
    	updateDevelopmentState(response) {
            this.dev_enabled_tmp = this.dev_enabled;

            if (this.current_branch) this.current_branch_tmp = this.current_branch;
  			else this.current_branch_tmp = null;

  			this.initialized=true;

  			this.checkChanged();
    	},
    	checkChanged() {
    		if (this.dev_enabled != this.dev_enabled_tmp) this.settings_changed=true;
    		else if (this.dev_enabled_tmp && this.current_branch != this.current_branch_tmp) this.settings_changed=true; 
    		else this.settings_changed=false;
    	},
    	reloadBranches() {
			this.reloading = true;
			this.$store.dispatch('git/reloadBranches')
				.then(() => {
					this.reloading = false;
				}).catch(error => {
					console.log(error);
					this.reloading = false;
				});
    	},
    	saveDevSettings() {
			if (this.loading) return false;
    		this.loading = true;
			if (this.dev_enabled_tmp) {
				const request = {
					branch: this.current_branch_tmp,
					remote_url: this.remote_url
				};
				this.toggleDevMode(request, 'git/enableDevelopmentMode');
			} else {
				this.toggleDevMode({}, 'git/disableDevelopmentMode');
			}

    	},
		toggleDevMode(request, action) {
			this.$store.dispatch(action, request)
				.then(() => {
					this.getGitConfig();
					this.error_message = null;
				}).catch(error => {
					this.loading = false;
					this.error_message = error.response.data.message;
				})
		},
		getGitConfig() {
			this.$store.dispatch('git/getGitConfig', 'develop')
				.then(response => {
					this.updateDevelopmentState(response);
					this.loading = false;
				}).catch(error => {
					this.loading = false;
					console.log(error);
				});
		}
    },
    computed: {
      	...mapState('git', [
	    	'configured',
	    	'dev_enabled',
	    	'remote_url',
	    	'branches',
	    	'current_branch',
	    	'app_mode'
  		]),
  		...mapState('admin', [
	    	'role'
  		])
  	},
  	created() {
  		this.getGitConfig();
		this.reloadBranches();
		this.$store.dispatch('admin/adminSection', '/admin/devmode');
  	},
}
</script>

<style lang='less'>
.v-application--wrap {
	font-family: "Montserrat-Medium";
	.v-toolbar__title {
		font-size: 18px !important;
	}
	.mode-action {
		width: max-content;
		height: 36px;
		border-radius: 3px;
		font-family: "OpenSans-Regular";
		display: flex;
		border: 0.5px solid #d1d5db;
		.action {
			border-radius: 3px;
			display: flex;
			align-items: center;
			padding: 0 10px !important;
		}
		.action-active {
			color: #fff;
			background: #2a9d8f;
			height: 100%;
		}
		.action-inactive {
			background: #fff;
			color: rgba(0, 0, 0, 0.65);
		}
	}
	.form-group {
		width: 288px;
		.form-item {
			width: 248px;
			height: 48px;
			font-family: "Montserrat-Light";
			outline: none !important;
		}
		.reload-icon {
			width: 30px;
			height: 30px;
			margin-left: 10px;
			margin-top: 13px;
		}
	}
	.branch-text {
		font-family: 'Montserrat-Regular';
	}
	.v-btn {
		font-size: 12px;
		font-family: 'Montserrat-Regular';
	}
}
</style>
