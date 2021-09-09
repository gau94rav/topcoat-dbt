<template>
	<v-icon class="spinner-loader centered-element-absolute" v-if='!initialized'>mdi-loading</v-icon>
	<v-layout v-else>
		<v-card elevation="0" width="100%" class="secret-section">
			<div class="main-title-admin">Configure Secrets</div>
			<div class="spacer-div my-5 mb-2"></div>
			<div class="d-flex flex-column">
				<div
					v-for="(connection, index) in connections"
					:key="index"
				>
					<div class="secret-form-groups d-flex flex-column">
						<label>
							<span>{{ getLabel(connection) }}</span>
							<span v-if='connection.name'>
								({{ connection.name }})
							</span>
						</label>
						<textarea
							class="secret-textarea outline"
							:placeholder="`Enter ${getLabel(connection)}`"
							v-if="connection.type == 'bigquery'"
							@change="changeCount++"
							v-model="connection.secret"
							rows="2"
						>
						</textarea>
						<input
							v-else
							type='password'
							v-model="connection.secret"
							@change="changeCount++"
							class="secret-textarea outline"
							:placeholder="`Enter ${getLabel(connection)}`"
						/>
					</div>
					<div style='margin-bottom: 15px'></div>
				</div>
			</div>
			<v-btn elevation="0" class="mt-12" color="#56788F" :disabled="!changeCount" @click="saveConnections">
				<span class="d-flex">
					<v-icon :class="{'spinner-loader': loading}">mdi-{{ loading ? 'loading' : 'content-save-outline' }}</v-icon>
					<span class="ml-1 mt-1 d-flex align-self-center" :style="{fontSize: '14px', color: changeCount ? '#fff' : ''}">Save</span>
				</span>
			</v-btn>
		</v-card>
	</v-layout>
</template>

<script>

import { mapState } from 'vuex';
import { SECRET_KEY_LABELS } from '../../assets/constants/labels';

export default {
    name: "Secrets",
    data() {
    	return {
    		changeCount: 0,
			connections: [],
			mapbox_token: null,
			jwt_secret: null,
			loading: false,
			initialized: false,
    	}
    },
    created: function() {
		this.getAdminSecrets();
  	},
    methods: {
		getAdminSecrets() {
			this.loading = true;
			this.$store.dispatch('git/getAdminSecrets')
				.then(response => {
					this.connections = response.data.connections;
					this.mapbox_token = response.data.mapbox_token;
					this.jwt_secret = response.data.jwt_secret;
					this.changeCount = 0;
					this.loading = false;
					this.initialized = true;
				})
				.catch((error) => {
					this.loading = false;
					console.log(error);
				})
		},
    	saveConnections: function() {
			var payload = {
				connections: this.connections,
				mapbox_token: this.mapbox_token,
				jwt_secret: this.jwt_secret
			}
			this.loading = true;
			console.log(payload);
			this.$store.dispatch('git/saveAdminSecrets', payload)
				.then(() => {
					this.loading = false;
					this.changeCount = 0;
				}).catch(error => {
					this.loading = false;
					console.log(error);
				})
			
    	},
    	getLabel: function(connection) {
			const label = SECRET_KEY_LABELS[connection.type];
			return label ? label : connection.type;
		},
    },
    computed: {
      	...mapState('git', [
	    	'app_mode',
  		]),
  	},
}
</script>

<style lang='less'>
	.secret-section {
		font-family: 'Montserrat-Regular';
		overflow-y: auto;
		label {
			font-family: 'Montserrat-Medium';
			padding: 5px 0;
		}
		.secret-textarea {
			width: 600px;
			border-radius: 5px;
			padding: 10px;
			outline: none !important;
		}
		textarea {
			min-height: 50px !important;
		}
	}
	@media (max-width: 960px) {
		.secret-textarea {
			width: 100% !important;
		}
	}
</style>
