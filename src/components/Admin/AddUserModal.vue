<template>
  <div class="text-center d-flex flex-column justify-center">
    <v-dialog
      v-model="dialog"
      width="650"
      class="add-user-dialog"
      @input='toggleDialog'
      :persistent='loading'
    >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                class="outline add-user-btn"
                elevation="0"
                v-bind="attrs"
                v-on="on"
                min-width="36px"
                v-if='type === "add"'
                :disabled='disabled'
            >
                <v-icon
                    style='padding: 0px'
                    class="standard-icon-size"
                >
                    mdi-plus
                </v-icon>
            </v-btn>
            <span
                class="user-action-btn"
                v-else-if='type === "edit"'
            >
                <span v-if='!disabled' v-bind="attrs" v-on="on">Edit</span>
                <span v-else class="disabled-item">Edit</span>
            </span>
        </template>

        <v-card class="add-user-card">
            <div class="card-head-section d-flex justify-space-between">
                <v-card-title class="head-text">
                    {{ type === 'add' ? 'Create' : 'Edit' }} User
                </v-card-title>
                <v-icon :disabled='loading' class="cursor-pointer mr-3 close-button" @click="dialog = false">mdi-close</v-icon>
            </div>
            <v-divider></v-divider>
            <form>
                <div class="form-grid email-section">
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <span v-if='(editIndex === null)'>
                            <input
                                placeholder="Enter email address"
                                type="email"
                                :disabled='loading'
                                class="form-control outline"
                                id='email'
                                v-model='email'
                                @input='checkValidation'
                            >
                            <div class="error-message d-flex justify-space-between" v-if='emailUsed'>
                                Email is already in use.
                            </div>
                        </span>
                        <div v-else class="user-email-placeholder">{{ email }}</div>
                    </div>
                    <div class="form-group" v-if='(editIndex === null)'>
                        <v-checkbox class="mt-6" v-model='invite' label='Send Invitation'></v-checkbox>
                    </div>
                </div>
                <div class="form-grid role-group-section mt-4">
                    <div class="form-group">
                        <label for='role'>Role:</label>
                        <v-select
                            :disabled='loading'
                            outlined
                            dense
                            id='role'
                            :items='roles'
                            v-model="role"
                        ></v-select>
                    </div>
                    <div class="form-group">
                        <label for="group">Group:</label>
                        <v-select
                            outlined
                            :disabled='loading'
                            dense
                            id='group'
                            :items='groups'
                            item-text="name"
                            item-value="id"
                            v-model="group"
                        >
                        </v-select>
                    </div>
                </div>
                <label class="mx-4">Metadata:</label>
			  	<div class='metadata-editor-container mx-4'>
			        <user-metadata-editor
                        :index='editIndex'
                        @metadataValid='checkValidation'
                    />
                </div>
            </form>
            <v-divider></v-divider>
            <v-card-actions class="add-user-actions">
                <v-btn
                    :disabled='loading'
                    class="add-user-btn outline"
                    elevation="0"
                    width="100px"
                    @click='dialog = false'
                >
                    <span>Cancel</span>
                </v-btn>
                <v-btn
                    :disabled='loading || !validated'
                    class="outline"
                    elevation="0"
                    width="100px"
                    color="#2a9d8f"
                    @click='handleSaveUser'>
                    <span v-if='!loading'>{{ (editIndex !== null) ? 'Save' : 'Create' }}</span>
                    <v-icon class="spinner-loader" v-else>mdi-loading</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
  </div>
</template>

<style lang="less" src='../../assets/styles/adminUserGroupModal.less'></style>

<script>
import { mapState } from 'vuex'
import UserMetadataEditor from './UserMetadataEditor';

export default {
    props: ['type', 'userEmail', 'disabled'],
    components: {
        UserMetadataEditor,
    },
    data: () => ({
        invite: false,
        dialog: false,
        roles: ['Administrator', 'Developer', 'Group Switcher', 'User'],
        role: 'User',
        group: null,
        email: '',
        loading: false,
        validated: false,
        editIndex: null,
        user: {},
        emailUsed: false,
    }),
    computed: {
        ...mapState('admin', [
            'groups',
            'new_user_metadata',
            'new_user_metadata_valid',
            'users',
            'app_metadata',
            'app_metadata_valid',
        ]),
    },
    mounted() {
        this.$store.dispatch('admin/getUserGroups');
    },
    methods: {
        handleSaveUser() {
            const newUser = !this.editIndex;
            if (newUser) {
                const metadata = Object.assign({}, JSON.parse(this.new_user_metadata));
                const { email, invite } = this;
                metadata.role = this.role;
                metadata.group_id = this.group;
                this.createUserRequest({email, invite, metadata});
            } else {
                this.updateUser();
            }
        },
        createUserRequest(data) {
            this.loading = true;
            this.$store.dispatch('admin/createNewUser', data)
                .then(() => {
                    this.loading = false;
                    this.dialog = false;
                    this.$emit('refresh');
                })
                .catch(error => {
                    console.log(error);
                    this.loading = false;
                    this.$alert({
                        message: 'Failed to create new user',
                        type: 'error',
                    })
                })
        },
        createNewMetadata() {
            this.loading = true;
            this.editIndex = null;
    		const metadata = JSON.stringify({ "custom_attributes" : {} });
            this.$store.dispatch('admin/newUserMetadata', metadata);
            this.$store.dispatch('admin/newUserMetadataValid', true);
            this.loading = false;
        },
        updateUser() {
            const metadata = Object.assign({}, JSON.parse(this.app_metadata[this.editIndex]));
            metadata.set_initial_password = this.user.app_metadata.set_initial_password;
            metadata.allowed_domains = this.user.app_metadata.allowed_domains;
            metadata.allowed_subdomains = this.user.app_metadata.allowed_subdomains;
            metadata.customer_id = this.user.app_metadata.customer_id;
            metadata.app_admin = this.user.app_metadata.app_admin;
            metadata.role = this.role;
            metadata.group_id = this.group;
            this.loading = true;
            this.$store.dispatch('admin/updateUser', {metadata, email: this.email})
                .then(() => {
                    this.$emit('refresh');
                    this.loading = false;
                    this.dialog = false;
                })
                .catch(error => {
                    this.loading = false;
                    console.log(error);
                    this.$alert({
                        message: 'Failed to update user',
                        type: 'error',
                    })
                })
        },
        getUserData() {
            this.editIndex = this.users.findIndex(item => item.email === this.$props.userEmail);
            this.user = this.users[this.editIndex];
            if (this.user) {
                this.email = this.user.email;
                this.group = this.user.app_metadata.group_id;
                this.role = this.user.role;
                return this.validated = true;
            }
            console.log('Failed to get user data');
        },
        emailInUse() {
            const users = this.users || [];
            const used = users.filter(u => u.email === this.email).length;
            this.emailUsed = false;
            if (used) {
                this.emailUsed = true;
            }
            return used;
        },
        checkValidation(metadatavalid = false) {
            if (this.$props.type === 'add') {
                const alreadyInUse = this.emailInUse();
                this.validated = this.new_user_metadata_valid && 
                    this.email &&
                    this.email.includes('@') && 
                    this.email.length >= 8 &&
                    this.new_user_metadata_valid &&
                    !alreadyInUse;
                
            } else {
                this.validated = metadatavalid;
            }
        },
        reset() {
            this.email = '';
            this.group = null;
            this.role = 'User';
            this.invite = false;
        },
        toggleDialog() {
            const dialog = this.dialog;
            if (dialog) {
                this.reset();
                const type = this.$props.type;
                if (type === 'add') {
                    this.createNewMetadata();
                } else {
                    this.getUserData();
                }
            }
        }
    },
}
</script>