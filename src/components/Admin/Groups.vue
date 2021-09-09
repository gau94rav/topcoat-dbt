<template>
	<v-icon class="spinner-loader centered-element-absolute" v-if='!initialized'>mdi-loading</v-icon>
	<v-layout class="groups-section" v-else>
		<v-card elevation="0" width="100%">
			<div class="d-flex justify-space-between align-center">
				<div class="main-title-admin">Groups</div>
				<add-group-modal type='add' @refresh='queryGroups' />
			</div>
			<div class="spacer-div my-5 mb-7"></div>
			<v-data-table
				class="outline"
				:items-per-page="6"
				hide-default-footer
				@page-count="pageCount = $event"
				:page.sync="page"
				:headers='columns'
				:items='groups'
			>
				<template v-slot:item.name='{item}'>
					<strong>{{ item.name }}</strong>
				</template>
				<template v-slot:item.metadata='{item}'>
					<v-chip color="blue" label outlined>
						{{ item.metadata.persona || 'default' }}
					</v-chip>
				</template>
				<template v-slot:item.actions='{item}'>
					<div class="d-flex align-center">
						<add-group-modal
							:id='item.id'
							type='edit'
							:disabled='item.id == deleting'
							@refresh='queryGroups'
						/>
						<v-divider vertical class="vertical-divider" />
						<confirm-popup
							title='Delete'
							type='span'
							:loading='deleting == item.id'
							width='39.55px'
							customClass='user-action-btn'
							:message="`Are you sure delete group '${item.name}'?`"
							@confirm='deleteGroups(item)'
						/>
					</div>
				</template>
			</v-data-table>
			<v-pagination
				v-model="page"
				:length="pageCount"
				:total-visible="5"
				class="mt-3"
				color="#2a9d8f">
			</v-pagination>
		</v-card>
	</v-layout>
</template>

<script>

import { mapState } from 'vuex';
import AddGroupModal from './AddGroupModal';
import ConfirmPopup from '../common/ConfirmPopup';

export default {
    name: "Groups",
    components : { AddGroupModal, ConfirmPopup },
    data() {
    	return {
    		initialized: false,
    		passwordModalVisible: false,
    		creatingGroup: false,
    		loading: true,
    		addKey: 0,
    		columns: [
	          {
	            text: 'Name',
	            value: 'name',
	            scopedSlots: { customRender: 'name' }
	          },
	          {
	            text: 'Persona',
	            value: 'metadata',
	            scopedSlots: { customRender: 'persona' }
	          },
	          {
	            text: 'ID',
	            value: 'id',
	          },
	          {
	            text: 'Actions',
	            value: 'actions',
	            width: '200px',
	            scopedSlots: { customRender: 'actions' }
	          }
	        ],
			page: 1,
			pageCount: 0,
			deleting: -1,
    	}
    },
    created: function() {
    	this.queryGroups();
		this.$store.dispatch('admin/adminSection', '/admin/groups');
  	},
  	computed: {
      	...mapState('admin', [
          'groups',
          'group_metadata',
          'group_metadata_valid',
          'new_group_metadata',
          'new_group_metadata_valid'
        ])
  	},
    methods: {
    	queryGroups() {
		    this.$store.dispatch('admin/getUserGroups')
				.then(() => {
					this.initialized = true;
					this.loading = false;
				})
				.catch(error => {
					console.log(error);
					this.loading = false;
					this.$alert({message: 'Failed to get groups', type: 'error'})
				});
    	},
    	deleteGroups(group) {
			if (!group) return this.$alert({message: 'Failed to find group', type: 'error'});
			const id = group.id;
			this.deleting = group.id;
			this.$store.dispatch('admin/deleteGroup', id)
				.then(() => {
					this.queryGroups();
					this.deleting = -1;
				})
				.catch(error => {
					console.log(error);
					this.deleting = -1;
					this.$alert({message: 'Failed to delete group', type: 'error'});
				})
    	},
    }
}
</script>

<style lang='less'>
	.groups-section {
		font-family: 'Montserrat-Regular';
		.add-group-btn {
			color: rgba(0, 0, 0, 0.65) !important;
			background: #fff !important;
			text-transform: none !important;
			width: 80px;
		}
	}
</style>
