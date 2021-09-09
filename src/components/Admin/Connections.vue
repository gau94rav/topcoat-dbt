<template>
	<v-layout class="connections-section">
		<v-icon class="spinner-loader centered-element-absolute" v-if='!initialized'>mdi-loading</v-icon>
		<v-card v-else elevation="0" width="100%" class="connections-container" @mouseleave="menu = -1">
			<div class="d-flex justify-space-between align-center">
				<div class="main-title-admin">
					Connections
					<v-icon v-if='loading' class="spinner-loader">mdi-loading</v-icon>
				</div>
				<add-connection-modal @queryConnections='queryConnections' type='add' />
			</div>
			<div class="spacer-div my-5 mb-7"></div>
			<v-data-table
				class="outline"
				:headers='columns'
				:items='connections'
				:items-per-page="10"
				hide-default-footer
				@page-count="pageCount = $event"
				:page.sync="page"
			>
				<template v-slot:item.name='{item}'>
					<strong>{{ item.name }}</strong>
				</template>
				<template v-slot:item.type='{item}'>
					<v-chip small :color="chipColors[item.type]" label outlined>
						<span class="default-small-fonts">{{ connectionLabels[item.type] || item.type }}</span>
					</v-chip>
				</template>
				<template v-slot:item.actions='{item}'>
					<div style='width: 100%;' class="d-flex align-center">
						<add-connection-modal
							v-if="item.type != 'sqlite3'"
							type='edit'
							:editIndex='item.index'
							:disabled='deletingIndex === item.index || updatingConnectionIndex === item.index'
							@queryConnections='queryConnections'
						/>
						<!-- <v-divider v-if="item.type != 'sqlite3'" vertical class="vertical-divider" />
						<span v-if="item.type != 'sqlite3'" @click='testConnection(item.index)' class="modal-action-btn cursor-pointer">
							<span v-if='testingIndex !== item.index'>Test</span>
							<v-icon v-else class="spinner-loader">mdi-loading</v-icon>
						</span> -->
						<v-divider v-if="item.type != 'sqlite3'" vertical class="vertical-divider" />
						<div class="position-relative">
							<v-icon style='position: relative; bottom: 1px;' :class="{'spinner-loader': deletingIndex === item.index}" class="default-icon-size cursor-pointer" @click='menu = item.index'>mdi-cog</v-icon>
							<div class="action-menu" v-if='menu === item.index'>
								<div class="action-menu-items">
									<confirm-popup
										customClass='modal-action-btn cursor-pointer'
										title='Delete'
										type='span'
										width='39.55px'
										message='Are you sure?'
										@confirm='deleteConnection(item.index)'
										@closed='menu = -1'
										:disabled='deletingIndex == item.index || item.yml'
										:loading='deletingIndex == item.index'
									/>
								</div>
							</div>
						</div>
					</div>
				</template>
			</v-data-table>
			<v-pagination
				v-model="page"
        		:length="pageCount"
				:total-visible="5"
				class="mt-3"
				color="#2a9d8f"
			></v-pagination>
		</v-card>
	</v-layout>
</template>

<script>
import { mapState } from 'vuex';
import AddConnectionModal from './AddConnectionModal';
import ConfirmPopup from '../common/ConfirmPopup';
import { CONNECTION_LABELS } from '../../assets/constants/labels';
import { CONNECTION_COLUMNS, CONNECTION_COLORS } from '../../assets/constants/tables';
export default {
    name: "Connections",
	components: {
		AddConnectionModal,
		ConfirmPopup,
	},
    data() {
    	return {
			connectionLabels: CONNECTION_LABELS,
			chipColors: CONNECTION_COLORS,
	        columns: CONNECTION_COLUMNS,
    		legacyConnections: null,
    		initialized: false,
			loading: false,
			page: 1,
			pageCount: 0,
			menu: -1,
			connections: [],
			showConnections: ['amazonRedShift', 'bigquery', 'postgres', 'snowflake'],
    	}
    },
    created() {
    	this.queryConnections()
		this.$store.dispatch('admin/adminSection', '/admin/connections');
  	},
    methods: {
		testConnection(index) {
			const connection = this.connections[index];
			if (connection) {
				this.testingIndex = index;
				this.$store.dispatch('admin/testConnection', connection)
					.then((response) => {
						this.testingIndex = -1;
						this.$alert({type: response.data.status || 'error', message: response.data.message || 'Test: Failed!'});
					}).catch(error => {
						this.testingIndex = -1;
						this.$alert({type: 'error', message: 'Test: Connection Failed!'});
						console.error(error);
					})
			}
		},
		deleteConnection(index) {
			this.deletingIndex = index;
			this.menu = -1;
			var connection = null;
			for (var i=0; i<this.connections.length; i++) {
				if (this.connections[i].index == index) {
					connection = this.connections[i];
				}
			}
			this.$store.dispatch('admin/deleteConnection', connection)
				.then(() => {
					this.queryConnections();
					this.deletingIndex = -1;
				}).catch(error => {
					this.$alert({type: 'error', message: 'Failed to delete connection'});
					this.deletingIndex = -1;
					console.error(error);
				})
		},
    	queryConnections() {
    		const connections = [];
			this.$store.dispatch('admin/queryConnections')
		      .then((response)  =>  {
		          var all_connections = response.data.connections;
		          for (var i = 0; i < all_connections.length; i++) {
		            if (this.showConnections.indexOf(all_connections[i].type) > -1) {
		            	var connection = {
		            		index: i,
		            		type: all_connections[i].type
		            	}
		            	
		            	if (all_connections[i].name) connection.name = all_connections[i].name;
		            	else connection.name = "-";
		            	if (all_connections[i].username) connection.username = all_connections[i].username;
		            	else connection.username = "-";
		            	if (all_connections[i].database) connection.database = all_connections[i].database;
		            	else if (all_connections[i].db_filename) connection.database = all_connections[i].db_filename;
		            	else connection.database = "-";
		            	if (all_connections[i].host && all_connections[i].port) {
		            		connection.host = all_connections[i].host;
		            		connection.port = all_connections[i].port;
		            		connection.hostport = all_connections[i].host + ':' + all_connections[i].port;
		            	}
		            	else if (all_connections[i].host) {
		            		connection.host = all_connections[i].host;
		            		connection.hostport = all_connections[i].host;
		            	}
		            	else if (all_connections[i].account) {
		            		connection.account = all_connections[i].account;
		            		connection.hostport = all_connections[i].account + ".snowflakecomputing.com:443";
		            	}
		            	if (all_connections[i].schema) connection.schema = all_connections[i].schema;
		            	if (all_connections[i].warehouse) connection.warehouse = all_connections[i].warehouse;
		            	if (all_connections[i].secret) connection.secret = all_connections[i].secret;
		            	else if (all_connections[i].type == 'sqlite3') connection.hostport = "Internal";
		              	connections.push(connection);
		            }
		          }
				  this.connections = connections;
		          var stored_connections = [];
	              for (var i = 0; i < all_connections.length; i++) {
	                if (this.showConnections.indexOf(all_connections[i].type) > -1) {
	                  all_connections[i].connection_index = i;
	                  stored_connections.push(all_connections[i]);
	                }
	              }
				  this.$store.dispatch('admin/setConnections', stored_connections);
	              if (this.connection == null && stored_connections.length) {
					this.$store.dispatch('admin/activeConnection', 0);
				  }
				  this.initialized = true;
		      }, (error)  =>  {
		          console.log("Connections failed");
		      })
    	},
    },
    computed: {
      	...mapState('admin', [
          'connection',
		  'updatingConnectionIndex',
		  'deletingConnectionIndex',
		  'testingConnectionIndex',
        ]),
		deletingIndex: {
			get() { return this.deletingConnectionIndex },
			set(val) {
				this.$store.dispatch('admin/deleteConnectionIndex', val);
			}
		},
		testingIndex: {
            get() { return this.testingConnectionIndex },
            set(index) {
                this.$store.dispatch('admin/testConnectionIndex', index)
            }
        }
  	},
}
</script>

<style lang="less" src="../../assets/styles/vuetifyTable.less"></style>

<style lang='less'>
	.connections-section {
		font-family: 'Montserrat-Regular';
	}
</style>