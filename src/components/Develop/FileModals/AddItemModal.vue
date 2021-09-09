<template>
    <v-dialog max-width="520" v-model='dialog' @input="toggle" :persistent='saving'>
        <v-card class="modal-container">
            <v-card-title class="modal-title">Add New {{ actionData.endpoint === 'addNewFile' ? 'File' : 'Directory' }}</v-card-title>
            <div class="spacer-div"></div>
            
            <div class="modal-content">
                <div class="modal-body">
                    <div class="modal-label">Location:</div>
                    <div>{{ actionData.label }}</div>

                    <div class="form-group pt-10">
                        <label for='name' class="modal-label">Name:</label>
                        <v-text-field
                            class="modal-input"
                            :placeholder="actionData.endpoint === 'addNewFile' ? 'Enter File Name' : 'Enter Directory Name'"
                            id='name'
                            ref='itemNameInput'
                            outlined
                            v-model='name'
                            :error="error ? true : false"
                            :error-messages="error || ''"
                            @input='() => { inputValidate ? validated() : null }'
                        />
                    </div>
                </div>
                <div class="spacer-div"></div>
                <v-card-actions class="modal-actions">
                    <v-spacer></v-spacer>

                    <v-btn
                        elevation="0"
                        class="outline close-btn"
                        @click="close"
                        color="rgba(42, 157, 143, 0.08)"
                        :disabled='saving'
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        elevation="0"
                        class="outline save-btn"
                        @click="save"
                        color="#2a9d8f"
                        :disabled='saving'
                    >
                        <v-icon v-if='saving' class="spinner-loader">mdi-loading</v-icon>
                        <span>OK</span>
                    </v-btn>
                </v-card-actions>
            </div>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: ['actionData'],
    data: () => ({
        dialog: true,
        name: '',
        error: '',
        inputValidate: false,
        saving: false,
    }),
    mounted() {
        this.$nextTick(() => {
            setTimeout(() => {
                this.$refs.itemNameInput.focus();
            })
        })
    },
    methods: {
        close(refresh = false) {
            if (refresh) {
                this.$emit('refresh');
            }
            return this.$emit('close');
        },
        toggle() {
            if (!this.dialog) {
                this.close();
            }
        },
        validated() {
            this.error = null;
            const name = this.name;
            this.inputValidate = true;
            if (!name) {
                this.error = 'Name is required';
                return false;
            }
            return true;
        },
        save() {
            if (this.validated()) {
                const actionData = this.$props.actionData;
                const location = actionData.location;
                const name = this.name;
                const payload = this.getPayload(location, name, actionData.endpoint);
                this.saving = true;
                this.$store.dispatch(`ide/${actionData.endpoint}`, payload)
                    .then(() => {
                        this.saving = false;
                        this.$store.dispatch('ide/getFileList');
                        this.$store.dispatch('ide/getBranchStatus', 'ide');
                        this.close(true);
                    })
                    .catch(error => {
                        const message = error.response.data.message;
                        this.saving = false;
                        if (!message) {
                            return this.$alert({message: 'Failed to add item', type: 'error'});
                        }
                        return this.error = message;
                    })
            }
        },
        getPayload(location, name, endpoint) {
            if (endpoint === 'makeDir') {
                return {
                    location,
                    name
                }        
            }
            return { file_path: `${location}/${name}` };
        }
    }
}
</script>