<template>
	<v-icon class="spinner-loader centered-element-absolute" v-if='!initialized'>mdi-loading</v-icon>
  	<v-layout column v-else>
		<div class="d-flex justify-space-between align-center">
			<div class="main-title-admin">Git Configuration</div>
			<confirm-popup
				title='Reset Git Configuration'
				icon='mdi-alert-outline'
				message='Reset Git?  This cannot be undone.'
				color='#e76f51'
				customClass='reset-git-btn'
				:loading='loading'
				:disabled='!configured'
				@confirm='resetGit'
			/>
		</div>
		<div class="spacer-div my-5"></div>
		<div v-show="configured">
			<div class="main-subtitle-admin">Repository URL:</div>
			<div class="pt-1 main-text-admin">
				{{ remote_url }}
			</div>
			<div v-if="role =='Administrator'">
				<div class="git-title pt-5 d-flex justify-space-between">
					<div class="d-flex align-center main-subtitle-admin">Deploy Key:</div>
					<v-icon @click="copyToClipboard($event, true)" class="git-icon outline">mdi-content-copy</v-icon>
				</div>
				<div ref='sshKey' class="pb-10 pt-1 main-text-admin git-text">{{ deploy_key }}</div>
			</div>
		</div>
		<div class="mt-2" v-show="!configured && initialized">
			<v-btn color="#2a9d8f" @click="configureGit">
				<div>Configure Git</div>
				<v-icon :class='{"spinner-loader": configure_loading}' class="ml-2 standard-icon-size">mdi-cog</v-icon>
			</v-btn>
			<v-dialog :persistent='loading' v-model="setupVisible" height='500' width="600" class="configure-dialog">
				<v-card height="500">
					<div class="d-flex justify-space-between">
						<v-card-title class="git-title">
							Configure Git
						</v-card-title>
						<v-card-actions>
							<v-icon :disabled='loading' @click="setupVisible = false">mdi-close</v-icon>
						</v-card-actions>
					</div>
					<div class="spacer-div"></div>
					<div class="configure-dialog-body px-4 pb-4" style="height: 365px">
						<v-stepper v-model='step'>
							<v-stepper-header>
								<v-stepper-step color='#2a9d8f' :complete="step > 1" step="1">Create Deploy Key</v-stepper-step>
								<v-stepper-step color='#2a9d8f' :complete="step > 2" step="2">Clone Repository</v-stepper-step>
								<v-stepper-step color='#2a9d8f' :complete="step > 3" step="3">Done</v-stepper-step>
							</v-stepper-header>
						</v-stepper>
						<div v-if='step === 1'>
							<div class="step-head pb-4 dialog-deploy-key-head d-flex justify-space-between">
								<v-subheader style="padding: 0px" class="ssh-url-header">Add this Deploy Key to your git repository settings with write access enabled:</v-subheader>
								<v-icon @click="copyToClipboard($event)" class="git-icon outline">mdi-content-copy</v-icon>
							</div>
							<textarea :value='ssh_key' ref='sshKey' class="git-text outline px-2 py-2" readonly></textarea>
						</div>
						<div v-if='step === 2'>
							<v-subheader class="ssh-url-header">Enter the SSH URL of your git repository:</v-subheader>
							<v-text-field :disabled='loading' outlined dense style="font-size: 12px" class="pt-1 px-4" v-model="git_url" placeholder="git@github.com:ORGANIZATION/REPOSITORY.git"></v-text-field>
						</div>
						<div v-if='step === 3' class="py-5 px-4">
							<b>Done!</b> The repository <i>{{ git_url }}</i> has been successfully cloned.
						</div>
						<div class="error-message" v-if='error_message'>
							<v-icon>mdi-alert-circle</v-icon>{{ error_message }}
						</div>
					</div>
					<div class="spacer-div"></div>
					<div class="configure-dialog-footer py-4 px-4 d-flex justify-end">
						<v-btn elevation="0" color='#56788F' :loading='loading' @click="handleNext" :disabled='step === 2 && notValidGitUrl'>
							<span v-if='step === 2 || step === 1'>Next Step</span>
							<span v-if='step === 3'>Finish</span>
						</v-btn>
					</div>
				</v-card>
			</v-dialog>
		</div>
		<div v-if="!configured && !initialized">
    		<v-icon class="spinner-loader">mdi-loading</v-icon>
		</div>
  </v-layout>
</template>

<script>

import { mapState } from 'vuex';
import ConfirmPopup from '../common/ConfirmPopup';

export default {
    name: "Git",
	components: {
		ConfirmPopup
	},
    data() {
    	return {
    		step: 1,
    		setupVisible: false,
    		git_url: "",
    		error_message: null,
    		ssh_key: null,
    		loading: false,
    		configure_loading: false,
    		settings_changed: false,
    		initialized: false
    	}
    },
    methods: {
    	resetGit() {
    		this.ssh_key = null;
    		this.error_message = null;
    		this.git_url = "";
    		this.step = 1;
			this.$store.dispatch('git/resetGitConfig')
				.catch(error => {
					console.log(error);
					this.setupVisible = false;
				})
    	},
    	resetState() {
    		this.setupVisible = false;
        	this.step = 1;
    		this.error_message = null;
    		this.git_url = "",
    		this.ssh_key = null;
    	},
    	handleNext() {
    		if (this.step == 2) {
	            this.loading = true;
				this.$store.dispatch('git/cloneMaster', { remote_url: this.git_url })
					.then(() => {
						this.$store.dispatch('git/reloadBranches');
						this.loading = false;
						this.$store.dispatch('git/getGitConfig');
						this.step++;
	              		this.error_message = null;
					}).catch(error => {
						this.loading = false;
						console.log(error);
						this.error_message = error.response.data.message;
					})
	        } else if (this.step == 3) {
	        	this.setupVisible = false;
	    	} else {
	    		this.step++;
	    	}
    	},
    	copyToClipboard(e, isDiv = false) {
			if (!isDiv) {
				this.$refs.sshKey.select();
			} else {
				const html = this.$refs.sshKey;
				if (html) {
					const textarea = document.createElement('textarea');
					textarea.id = 'copy-area';
					document.body.appendChild(textarea);
					const copyElement = document.getElementById('copy-area');
					copyElement.value = html.innerText;
					copyElement.select();
				}
			}
			document.execCommand('copy');
			this.$alert({message: 'Deploy key copied to clipboard', type: 'success'})
    	},
    	configureGit() {
    		this.configure_loading = true;
			this.$store.dispatch('git/resetGitConfig')
				.then(() => {
					this.resetState();
					this.$store.dispatch('git/generateSshKey')
						.then(response => {
							this.configure_loading = false;
							this.ssh_key = response.data.public_key;
							this.setupVisible = true;	
						}).catch(error => {
		        			this.configure_loading = false;
		        			this.setupVisible = false;
							console.log(error);
						})
				}).catch(error => {
					this.configure_loading = false;
	            	this.setupVisible = false;
					console.log(error);
				})
    	},
    },
    computed: {
      	...mapState('git', [
	    	'configured',
	    	'remote_url',
	    	'branches',
	    	'current_branch',
	    	'app_mode',
	    	'deploy_key'
  		]),
  		...mapState('admin', [
	    	'role'
  		]),
  		notValidGitUrl() {
    		if (this.git_url.includes("git") && this.git_url.includes("@") && this.git_url.includes(":") && this.git_url.includes(".git")) return false;
    		else return true	
    	},
  	},
  	created() {
		this.$store.dispatch('git/reloadBranches')
			.then(() => this.initialized = true);
		this.$store.dispatch('git/getGitConfig');
		this.$store.dispatch('admin/adminSection', '/admin/git');
  	}
}
</script>

<style lang='less'>
.v-application--wrap {
	font-family: "Montserrat-Regular";
}
.ssh-url-header {
	position: relative;
    width: max-content !important;
    height: max-content !important;
	font-size: 13px !important;
	display: flex;
	align-self: center;
}
.git-text {
	width: 100%;
	word-break: break-all;
	color: #272727;
	line-height: 22px;
}
.git-title {
	font-family: "Montserrat-Medium";
}
.v-btn {
	color: #fff !important;
	i {
		font-size: 14px;
	}
}
.v-stepper, .v-stepper__header {
	box-shadow: none !important;
	border: none;
}

.git-icon {
	width: 30px;
	height: 30px;
	border-radius: 50%;
	font-size: 16px !important;
}
textarea {
	min-height: 200px;
}

</style>
