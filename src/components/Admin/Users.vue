<template>
	<v-icon class="spinner-loader centered-element-absolute" v-if='!initialized'>mdi-loading</v-icon>
	<v-layout class="users-section" v-else>
		<v-card elevation="0" width="100%" class="users-container">
			<div class="d-flex justify-space-between align-center">
				<div class="main-title-admin">
					Users
					<v-icon v-if='loading' class="spinner-loader">mdi-loading</v-icon>
				</div>
				<add-user-modal
					:editIndex='editIndex'
					type='add'
					@refresh='queryUsers'
				/>
			</div>
			<div class="spacer-div my-5 mb-7"></div>
			<v-data-table
				class="outline"
				:headers='columns'
				:items='users'
				:items-per-page="6"
				hide-default-footer
				@page-count="pageCount = $event"
				:page.sync="page"
			>
				<template v-slot:item.email='{item}'>
					<strong>{{ item.email }}</strong>
				</template>
				<template v-slot:item.app_metadata='{item}'>
					<v-chip-group>
						<v-chip color='blue' label outlined>{{ item.role }}</v-chip>
						<v-chip v-if='groupById(item.role)' color='red' label outlined>{{groupById(item.role)}}</v-chip>
					</v-chip-group>
				</template>
				<template v-slot:item.last_login='{item}'>
					<span v-if='item.last_login'>{{ new Date(item.last_login).toLocaleString() }}</span>
					<span v-else>Never</span>
				</template>
				<template v-slot:item.actions='{item}'>
					<div class="d-flex align-center">
						<add-user-modal
							@refresh='queryUsers'
							:userEmail='item.name'
							:editIndex='editIndex'
							:disabled='deleting == item.index || resendingEmail == item.index'
							type='edit'
						/>
						<v-divider vertical class="vertical-divider" />
						<confirm-popup
							customClass='user-action-btn'
							title='Delete'
							type='span'
							width='39.55px'
							:message='`Are you sure delete user \"${users[item.index].email}\" ?`'
							:disabled='resendingEmail == item.index'
							:loading='deleting == item.index'
							@confirm='deleteUsers(item.index)'
						/>
						<v-divider vertical class="vertical-divider" />
						<span v-if='item.index == deleting' class="disabled-item">Resend Invite</span>
						<span v-else style='width: 81.73px' class="user-action-btn">
							<span v-if='resendingEmail != item.index' @click="handlePasswordResetRequest(item.name)">Resend Invite</span>
							<v-icon v-else class="spinner-loader relative-center d-flex">mdi-loading</v-icon>
						</span>
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
import UserMetadataEditor from './UserMetadataEditor';
import AddUserModal from './AddUserModal';
import ConfirmPopup from '../common/ConfirmPopup';

export default {
    name: "Users",
    components : { UserMetadataEditor, AddUserModal, ConfirmPopup },
    data() {
    	return {
    		initialized: false,
    		userModalVisible: false,
    		//passwordModalVisible: false,
    		email: null,
    		invite: false,
    		//password: null,
    		match: null,
    		//validpassword: false,
    		//passwordError: null,
    		//settingPassword: false,
      		editIndex: null,
    		creatingUser: false,
    		updatingUser: false,
    		role: null,
    		group: null,
    		loading: true,
    		columns: [
	          {
	            text: 'Account',
	            value: 'email',
	            scopedSlots: { customRender: 'email' }
	          },
	          {
	            text: 'Role/Group',
	            value: 'app_metadata',
	            scopedSlots: { customRender: 'group' }
	          },
	          {
	            text: 'Last Login',
	            value: 'last_login',
	            scopedSlots: { customRender: 'date' }
	          },
	          {
	            text: 'Actions',
	            value: 'actions',
	            width: '260px',
	            scopedSlots: { customRender: 'actions' }
	          }
	        ],
			page: 1,
			pageCount: 0,
			deleting: -1,
			resendingEmail: -1,
    	}
    },
    created: function() {
    	this.queryUsers();
		this.$store.dispatch('admin/adminSection', '/admin/users');
  	},
  	computed: {
      	...mapState('admin', [
          'users',
		  'groups',
        ])
  	},
    methods: {
    	queryUsers() {
			this.loading = true;
			this.$store.dispatch('admin/getUsers')
				.then(() => {
					this.loading = false;
					if (!this.initialized) {
						this.initialized = true;
					}
				})
				.catch(error => {
					this.loading = false;
					console.log(error);
				});
    	},
    	groupById(id) {
    		for (var i=0; i< this.groups.length; i++) {
    			if (this.groups[i].id == id) return this.groups[i].name;
    		}
    		return null;
    	},
    	/*validatePassword(event) {
    		if (this.match && this.password != this.match) {
	        	this.passwordError = "Passwords do not match."
	        	this.validpassword = false;
	        	return;
	      	}
	      	if (this.password.length < 8) {
	        	this.passwordError = "Password must be at least 8 characters long."
	        	this.validpassword = false;
	        	return;
	      	} 
	      	var matchedCase = new Array();
	      	//matchedCase.push("[$@$!%*#?&]"); // Special Charector
	      	matchedCase.push("[A-Z]");      // Uppercase Alpabates
	      	matchedCase.push("[0-9]");      // Numbers
	      	matchedCase.push("[a-z]");     // Lowercase Alphabates      

	      	var ctr = 0;
	      	for (var i = 0; i < matchedCase.length; i++) {
	          if (new RegExp(matchedCase[i]).test(this.password)) {
	              ctr++;
	          }
	      	}

	      	if (ctr < 3) {
	        	this.passwordError = "Password must contain one uppercase, one lowercase, and one number.";
	        	this.validpassword = false;
	        	return;
	      	}
	      	
	      	this.passwordError = null;
	      	this.validpassword = true;
    	},*/
    	handlePasswordResetRequest(email) {
    		this.editIndex = this.users.findIndex(item => item.email === email);
			if (this.deleting === this.editIndex) return false;
    		if (this.editIndex != null) {
				const email = this.users[this.editIndex].email;
				this.resendingEmail = this.editIndex;
				this.$store.dispatch('admin/sendPasswordResetRequest', {email})
					.then(() => {
						this.resendingEmail = -1;
						this.$alert({
							message: `Password reset link requested for '${email}'`,
							type: 'success'
						});
					})
					.catch(error => {
						this.resendingEmail = -1;
						this.$alert({
							message: `Password reset link request failed for '${email}'`,
							type: 'error'
						});
						console.log(error)
					})
			}
    	},
    	deleteUsers(index) {
			const email = this.users[index].email;
			if (!email) this.$alert({ message: 'Failed to get user', type: 'warning' });
			this.deleting = index;
			this.$store.dispatch('admin/deleteUser', email)
				.then(() => {
					this.deleting = -1;
					this.queryUsers();
				})
				.catch(error => {
					console.log(error);
					this.deleting = -1;
					this.$alert({ message: 'Failed to delete user', type: 'error' });
				})
    	},
    	setPassword(index) {
    		this.password = null;
    		this.match = null;
    		this.validpassword = false;
    		this.passwordError = null;
    		this.email = this.users[index].email;
    		this.passwordModalVisible = true;
    	},
    }
}
</script>

<style lang='less'>
.users-section {
	font-family: 'Montserrat-Regular';
}
</style>
