<template>
    <div class="admin-modal">
        <v-dialog
            v-model="show"
            :width="width || '650'"
            :persistent='loading'
            class="admin-dialog-section"
        >
            <template v-slot:activator="{ on, attrs }">
                <v-btn
                    class="outline admin-default-button"
                    elevation="0"
                    v-bind="attrs"
                    v-on="on"
                    min-width="36px"
                    v-if='type === "add" || !type'
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
                    class="modal-action-btn"
                    v-else-if='type === "edit"'
                >
                    <span v-if='!disabled' v-bind="attrs" v-on="on">Edit</span>
                    <span v-else class="disabled-item">Edit</span>
                </span>
            </template>
            <v-card class="modal-main-card">
                <div class="card-head-section d-flex justify-space-between">
                    <v-card-title class="head-text">
                        {{ title }}
                    </v-card-title>
                    <v-icon :disabled='loading' class="cursor-pointer mr-3 close-button" @click="show = false">mdi-close</v-icon>
                </div>
                <v-divider></v-divider>
                <div class="modal-content">
                    <div class="modal-body">
                        <slot></slot>
                    </div>
                </div>
                <v-divider></v-divider>
                <v-card-actions class="modal-actions d-flex justify-space-between">
                    <div>
                        <slot name='foot-left'></slot>
                    </div>
                    <div>
                        <slot name='foot-right'></slot>
                        <v-btn
                            v-if='!hideDefault'
                            :disabled='loading'
                            class="modal-cancel-btn dark-text outline"
                            elevation="0"
                            width="100px"
                            @click='show = false'
                        >
                            Cancel
                        </v-btn>
                        <v-btn
                            v-if='!hideDefault'
                            :disabled='loading'
                            class="modal-save-btn outline"
                            elevation="0"
                            width="100px"
                            color="#2a9d8f"
                            @click="$emit('confirm')"
                        >
                            <span v-if='!loading'>{{ (type === 'edit') ? 'Save' : 'Create' }}</span>
                            <v-icon class="spinner-loader" v-else>mdi-loading</v-icon>
                        </v-btn>
                    </div>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<style lang="less" src="../../../assets/styles/modals.less"></style>

<script>
export default {
    props: ['disabled', 'type', 'title', 'loading', 'hideDefault', 'width', 'dialog'],
    computed: {
        show: {
            get() {
                return this.dialog;
            },
            set(val) {
                this.$emit('toggleDialog', val);
            }
        }
    }
}
</script>