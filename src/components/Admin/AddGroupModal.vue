<template>
  <div class="text-center d-flex flex-column justify-center">
    <v-dialog
      v-model="dialog"
      width="650"
      class="add-user-dialog"
      @input='dialogToggle'
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

        <v-card class="add-group-card">
            <div class="card-head-section d-flex justify-space-between">
                <v-card-title class="head-text">
                    {{ type === 'add' ? 'Create' : 'Edit' }} Group
                </v-card-title>
                <v-icon :disabled='loading' class="cursor-pointer close-button mr-3" @click="dialog = false">mdi-close</v-icon>
            </div>
            <v-divider></v-divider>
            <form>
                <div class="form-grid group-id-section">
                    <div class="form-group">
                        <label for="group_id">Group ID {{ (editIndex === null) ? '(no spaces)' : ''}}:</label>
                        <input
                            placeholder="Enter group id"
                            type="text"
                            class="form-control outline"
                            id='group_id'
                            v-model='groupId'
                            v-if='(editIndex === null)'
                            @input='checkValidation'
                        >
                        <div class="user-group-id-placeholder" v-else>{{ groupId }}</div>
                        <span v-if='idError && (editIndex === null)' class="error-message">Already in use.</span>
                    </div>
                </div>
                <div class="form-grid group-details-section mt-4">
                    <div class="form-group">
                        <label for='name'>Name:</label>
                        <input
                            placeholder="Enter group name"
                            type="text"
                            class="form-control outline"
                            id='name'
                            v-model='name'
                        >
                    </div>
                    <div class="form-group">
                        <label for="persona">Persona:</label>
                        <v-select
                            outlined
                            dense
                            id='persona'
                            :items='personas'
                            item-text="name"
                            item-value="id"
                            v-model="persona"
                        >
                        </v-select>
                    </div>
                </div>
                <label class="mx-4">Metadata:</label>
			  	<div class='metadata-editor-container mx-4' v-if='initialized'>
			        <group-metadata-editor :key='addKey' :index='editIndex' @metadataValid='checkValidation' />
                </div>
            </form>
            <v-divider></v-divider>
            <v-card-actions class="add-user-actions">
                <v-btn
                    :disabled='loading'
                    class="add-user-btn outline"
                    width="100px"
                    elevation="0"
                    @click='dialog = false'
                >
                    <span>Cancel</span>
                </v-btn>
                <v-btn
                    :disabled='loading || !validated'
                    class="outline"
                    width="100px"
                    elevation="0"
                    color="#2a9d8f"
                    @click='handleSaveGroups'>
                    <span v-if='!loading'>{{ !isNaN(editIndex) ? 'Save' : 'Create' }}</span>
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
import GroupMetadataEditor from './GroupMetadataEditor';

export default {
    props: ['type', 'id', 'disabled'],
    components: {
        GroupMetadataEditor,
    },
    data: () => ({
        groupId: '',
        name: '',
        persona: 'default',
        personas: [],
        editIndex: null,
        addKey: 0,
        loading: false,
        validated: false,
        idError: false,
        initialized: false,
        dialog: false,
    }),
    computed: {
        ...mapState('admin', [
            'groups', 
            'new_group_metadata',
            'new_group_metadata_valid',
            'group_metadata',
            'group_metadata_valid',
        ]),
    },
    mounted() {
        this.getPersonas();
        if (this.$props.type === 'edit') {
            this.validated = true;
        }
    },
    methods: {
        getPersonas() {
            this.$store.dispatch('admin/getPersonas')
                .then(response => {
                    this.personas = response.data.personas;
                }).catch(error => console.log(error));
        },
        createNewGroupMetadata() {
            this.addKey =+ 1;
            this.editIndex = null;
    		const metadata = JSON.stringify({custom_attributes: {}}, null, 2);
            this.$store.dispatch('admin/newGroupMetadata', metadata);
            this.$store.dispatch('admin/newGroupMetadatValid', true);
            this.initialized = true;
            this.checkValidation();
        },
        handleSaveGroups() {
            const type = this.$props.type;
            if (type === 'add') {
                return this.addNewGroup();
            }
            return this.updateGroup();
        },
        checkValidation() {
            if (this.$props.type === 'add') {
                return this.validated = this.new_group_metadata_valid &&
                    this.groupId &&
                    this.groupId.length >= 2 && 
                    !this.groupId.includes(' ') && 
                    !this.groupIdUsed();
            }
            const metadataValid = this.group_metadata_valid[this.editIndex];
            return this.validated = metadataValid;
        },
        addNewGroup() {
            const metadata = Object.assign({}, JSON.parse(this.new_group_metadata));
            metadata.persona = this.persona;
            this.loading = true;
            this.$store.dispatch('admin/createNewGroup', {
                metadata,
                name: this.name,
                id: this.groupId,
            }).then(() => {
                this.loading = false;
                this.$emit('refresh');
                this.dialog = false;
            }).catch(error => {
                console.log(error);
                this.loading = false;
                this.$alert({message: 'Failed to create group', type:'error'});
            })
        },
        getGroupData() {
            this.editIndex = parseInt(this.groups.findIndex(group => group.id === this.$props.id));
            const group = this.groups[this.editIndex];
            if (!group) return this.$alert({message: 'Failed to find group data', type: 'error'});
            this.groupId = group.id;
            this.name = group.name;
            this.persona = group.metadata.persona;
            this.addKey += 1;
            this.initialized = true;
        },
        updateGroup() {
            const groupMetadata = this.group_metadata[this.editIndex];
            const metadata = Object.assign({}, JSON.parse(groupMetadata));
            const group = this.groups[this.editIndex];
            if (!group || !metadata) return this.$alert({
                message: 'Failed to update group',
                type: 'error',
            });
            this.loading = true;
            this.$store.dispatch('admin/updateGroup', {
                id: this.groupId,
                metadata,
                name: this.name
            }).then(() => {
                this.loading = false;
                this.dialog = false;
                this.$emit('refresh');
            }).catch(error => {
                this.loading = false;
                this.dialog = false;
                this.$alert({
                    message: 'Failed to update group',
                    type: 'error',
                });
                console.log(error);
            })
        },
        resetVars() {
            this.name = '';
            this.groupId = '';
            this.persona = '';
        },
        groupIdUsed() {
            const matchingGroups = this.groups.filter(group => group.id === this.groupId);
            this.idError = matchingGroups.length > 0;
            return this.idError;
        },
        dialogToggle() {
            const toggle = this.dialog;
            if (toggle) {
                if (this.$props.type === 'add') {
                    this.createNewGroupMetadata();
                } else {
                    this.getGroupData();
                }
            } else {
                this.resetVars();
            }
        }
    },
}
</script>