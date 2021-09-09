<template>
    <v-dialog max-width="416px" v-model="dialog" @input="toggle" :persistent='deleting'>
        <v-card class="modal-container delete-modal">
            <div class="modal-content">
                <div class="modal-head d-flex justify-space-between align-center">
                    <div></div>
                    <v-icon :disabled='deleting' @click="close" class="default-icon-size delete-close-icon cursor-pointer">mdi-close</v-icon>
                </div>
                <div class="modal-body">
                    <div class="modal-text d-flex">
                        <div class="modal-text-highlighted px-4 d-flex align-center" v-if='actionData.location'>
                            Do you want to delete {{ actionData.location }}?
                        </div>
                    </div>
                </div>
                <v-card-actions class="modal-actions">
                    <v-spacer></v-spacer>

                    <v-btn
                        elevation="0"
                        class="outline close-btn"
                        @click="close"
                        color="transparent"
                        :disabled='deleting'
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        elevation="0"
                        class="outline save-btn"
                        @click="deleteItem"
                        color="#2a9d8f"
                        :disabled='deleting'
                    >
                        <v-icon v-if='deleting' class="spinner-loader">mdi-loading</v-icon>
                        <span>Delete</span>
                    </v-btn>
                </v-card-actions>
            </div>
        </v-card>
    </v-dialog>
</template>

<style lang="less">
.delete-modal {
    padding: 10px;
    .modal-head {
        .delete-close-icon {
            position: relative;
            top: 5px;
            right: 5px;
        }
    }
    .modal-body {
        .modal-text {
            font-size: 14px !important;
            color: #272727 !important;
            justify-content: center;
            .modal-text-highlighted {
                width: max-content;
            }
        }
    }
}

</style>

<script>
export default {
    props: ['actionData'],
    data: () => ({
        dialog: true,
        name: '',
        error: '',
        inputValidate: false,
        deleting: false,
    }),
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
        deleteItem() {
            const actionData = this.$props.actionData;
            this.deleting = true;
            if (actionData.location) {
                return this.$store.dispatch('ide/deleteItem', actionData.location)
                    .then(() => {
                        this.$store.dispatch('ide/getFileList');    
                        this.$store.dispatch('ide/getBranchStatus', 'ide');
                        this.deleting = false;
                        this.close(true);
                    })
                    .catch(error => {
                        const message = error && error.response.data.message;
                        this.deleting = false;
                        if (!message) {
                            return this.$alert({message: 'Failed to delete item', type: 'error'});
                        }
                        return this.error = message;
                    })
            }
        },
    }
}
</script>