<template>
	<v-responsive height="100%" width="100%" class="overflow-auto">
		<v-icon class="spinner-loader centered-element-absolute" v-if='firstLoading'>mdi-loading</v-icon>
		<v-layout class="d-flex table-container" ref='container' v-else>
			<v-card elevation="0" width="100%">
				<div class="d-flex justify-space-between align-center">
					<div class="main-title-admin">Logs</div>
					<v-icon
						@click='reloadLogs'
						:class="{'spinner-loader': loading}"
						class="cursor-pointer outline reload-icon"
					>
						mdi-{{ !loading ? 'reload' : 'loading'}}
					</v-icon>
				</div>
				<div class="spacer-div my-5 mb-7"></div>
				<v-data-table
					:headers='columns'
					:items='log_entries'
					width='100%'
					height="30vw"
					class="outline"
					hide-default-footer
					items-per-page="10"
					@page-count="pageCount = $event"
					:page.sync="page"
				>
					<template v-slot:item.levelname="{ item }">
						<v-chip
							:color='getLevelColor(item.levelname)'
							label
  							outlined
						>
							{{ item.levelname }}
						</v-chip>
					</template>
				</v-data-table>
				<v-pagination
					v-model="page"
					:total-visible="5"
					:length="pageCount"
					class="mt-3"
					color="#2a9d8f"
				></v-pagination>
			</v-card>
		</v-layout>
	</v-responsive>
</template>

<script>

import { mapState } from 'vuex';

export default {
    name: "Logs",
    data() {
    	return {
    		columns : [
		    {
		      text: 'Timestamp',
		      value: 'timestamp',
		      defaultSortOrder: 'descend',
		      width: 180,
		    },
		    {
		      text: 'Module',
		      value: 'category',
		      width: 100,
		    },
		    {
		      text: 'Level',
		      value: 'levelname',
		      width: 100,
		      scopedSlots: { customRender: 'level' },
		      filters: [
		        {
		          text: 'CRITICAL',
		          value: 'CRITICAL',
		        },
		        {
		          text: 'ERROR',
		          value: 'ERROR',
		        },
		        {
		          text: 'INFO',
		          value: 'INFO',
		        },
		        {
		          text: 'DEBUG',
		          value: 'DEBUG',
		        }
      			],
      			onFilter: (value, record) => record.levelname.indexOf(value) === 0,
		    },
		    {
		      text: 'Message',
		      value: 'message',
		    },
  			],
  			entries: null,
			loading: false,
			firstLoading: false,
			page: 1,
			pageCount: 5,
    	}
    },
    created: function() {
		this.firstLoading = true;
    	this.reloadLogs();
		this.$store.dispatch('admin/adminSection', '/admin/logs');
  	},
    methods: {
    	reloadLogs() {
    		let last_time = 0;

	    	if (this.log_entries && this.log_entries.length) {
	    		last_time = this.log_entries[this.log_entries.length-1].created;
	    	}
			this.loading = true;
			this.$store.dispatch('admin/getLogs', last_time)
				.then(response => {
					this.loading = false;
					this.firstLoading = false;
				})
				.catch(error => {
					this.loading = false;
					this.firstLoading = false;
					console.log(error);
				})
    	},
    	getLevelColor(level) {
    		if (level == 'CRITICAL') return 'red';
    		else if (level == 'ERROR') return 'orange';
    		else return null; 
    	},
    },
    computed: {
      	...mapState('admin', [
	    	'log_entries'
  		])
  	},
}
</script>

<style lang='less'>
 .table-container {
	font-family: "Montserrat-Regular";
	.reload-icon {
		width: 32px;
		height: 32px;
		border-radius: 50%;
	}
 }
</style>
