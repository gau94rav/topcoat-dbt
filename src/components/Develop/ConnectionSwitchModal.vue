<template>
    <div class="connection-switch-modal">
        <v-dialog max-width="400" v-model='dialog' @input="toggle">
            <v-card class="modal-container">
                <div class="modal-content">
                    <div class="modal-head py-3 d-flex justify-space-between align-center">
                        <div class="ml-3 modal-title">Switch Schema Connection</div>
                        <v-icon @click="close" class="default-icon-size mr-3 cursor-pointer">mdi-close</v-icon>
                    </div>
                    <div class="spacer-div"></div>
                    <div class="modal-body">
                        <div class="modal-text d-flex">
                            <div class="flex-column w-100">
                                <label for="connection" class="modal-label">
                                    Connection:
                                </label>
                                <v-select
                                    outlined
                                    dense
                                    id='connection'
                                    :items='items'
                                    v-model='selectedConnection'
                                    item-text="name"
                                    item-value="connection_index"
                                >
                                </v-select>
                            </div>
                        </div>
                    </div>
                    <div class="spacer-div"></div>
                    <v-card-actions class="modal-actions">
                        <v-spacer></v-spacer>

                        <v-btn
                            elevation="0"
                            class="outline close-btn"
                            @click="close"
                            color="transparent"
                            :disabled='switching'
                        >
                            Cancel
                        </v-btn>
                        <v-btn
                            elevation="0"
                            class="outline save-btn"
                            @click="switchItem"
                            color="#2a9d8f"
                            :disabled='switching'
                        >
                            <v-icon v-if='switching' class="spinner-loader">mdi-loading</v-icon>
                            <span>Change</span>
                        </v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-dialog>
    </div>
</template>

<style lang="less">
    
</style>

<script>
import { mapState } from 'vuex';
export default {
    data: () => ({
        dialog: true,
        switching: false,
        selectedConnectionIndex: 0,
    }),
    computed: {
        ...mapState('ide', [
            'connections',
            'connection'
        ]),
        selectedConnection: {
            get () {
                return this.connection.toString();
            },
            set (value) {
                this.selectedConnectionIndex = value;
                return value;
            }
        },
        items() {
            return this.connections ? this.connections.map((c, i) => {
                return {
                    ...c,
                    title: c.name,
                    connection_index: c.connection_index.toString()
                }
            }) : [];
        }
    },
    methods: {
        close() {
            return this.$emit('close');
        },
        toggle() {
            if (!this.dialog) {
                this.close();
            }
        },
        switchItem() {
            const index = this.selectedConnectionIndex;
            const connection = this.connections[index];
            if (connection) {
                this.$store.dispatch('admin/activeConnection', index);
                this.$emit('refresh');
            }
        }
    }
}
</script>