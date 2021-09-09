<template>
    <v-dialog max-width="520" v-model='dialog' @input="toggle">
        <v-card class="modal-container">
            <div class="modal-content">
                <div class="modal-body">
                    <div class="modal-text d-flex">
                        <v-icon>mdi-help-circle</v-icon>
                        <div class="modal-text-highlighted px-4 d-flex align-center">
                            {{ message }}
                        </div>
                    </div>
                </div>
                <v-card-actions class="modal-actions">
                    <v-spacer></v-spacer>

                    <v-btn
                        elevation="0"
                        class="outline close-btn"
                        @click="close"
                        color="rgba(42, 157, 143, 0.08)"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        elevation="0"
                        class="outline save-btn"
                        @click="confirm"
                        color="#2a9d8f"
                    >
                        <span>OK</span>
                    </v-btn>
                </v-card-actions>
            </div>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: ['message', 'show'],
    computed: {
        dialog: {
            get() {
                return this.$props.show;
            },
            set(val) {
                if (!val) {
                    this.$emit('close');
                }
                return val;
            }
        }
    },
    methods: {
        toggle() {
            if (!this.dialog) {
                return this.$emit('close');
            }
        },
        close() {
            this.dialog = false;
            return this.$emit('close');
        },
        confirm() {
            this.dialog = false;
            return this.$emit('confirm');
        }
    }
}
</script>