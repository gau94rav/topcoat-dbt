<template>
    <div class="text-center d-flex flex-column justify-center">
        <v-dialog
            v-model='dialog'
            width='650'
            class="commit-dialog"
            @input="toggleDialog"
            :persistent='commiting'
        >
            <v-card class="modal-container">
                <div class="d-flex justify-space-between align-center py-5">
                    <div class="modal-title ml-4">
                        Commit Changes
                    </div>
                    <v-icon :disabled='commiting' @click="close" class="cursor-pointer mr-4">mdi-close</v-icon>
                </div>
                <div class="spacer-div mb-4"></div>
                <div class="d-flex px-6">
                    <div class="modal-label">
                        Repository:
                    </div>
                    <div class="modal-text pl-2 pb-1">
                        {{ friendlyGitName }}
                    </div>
                </div>
                <div class="d-flex px-6">
                    <div class="modal-label">
                        Branch:
                    </div>
                    <div class="modal-text pl-2 pb-4">
                        {{ current_branch }}
                    </div>
                </div>
                <div class="spacer-div"></div>
                <div class="modal-content">
                    <div class="modal-body">
                        <changes-files :data='modified' title='Modified' />
                        <changes-files :data='added' title='Added' />
                        <changes-files :data='deleted' title='Deleted' />
                        <changes-files :data='renamed' title='Renamed' />
                        <div class="commit-text pt-10" v-if='!hideAction'>
                            <v-textarea
                                outlined
                                height="110"
                                placeholder="Comment"
                                v-model='comment'
                            >
                            </v-textarea>
                        </div>
                    </div>
                    <v-card-actions v-if='!hideAction' class="modal-actions px-6 d-flex justify-space-between">
                        <div>
                            {{ changeCount || 0 }}
                            changed file{{ changeCount > 1 ? 's' : '' }}
                        </div>
                        <div>
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
                                class="outline ml-3 save-btn"
                                @click="confirm"
                                color="#2a9d8f"
                                :disabled='!comment || commiting'
                            >
                                <span>Commit</span>
                                <v-icon v-if='commiting' class="spinner-loader">mdi-loading</v-icon>
                            </v-btn>
                        </div>
                    </v-card-actions>
                </div>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import ChangesFiles from './ChangesFiles';
export default {
    props: ['show', 'hideAction'],
    components: {
        ChangesFiles,
    },
    data: () => ({
        comment: '',
        commiting: false,
    }),
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
        },
        ...mapState('git', [
            'remote_url',
            'current_branch',
        ]),
        ...mapState('ide', [
            'modified',
            'added',
            'conflicts',
            'renamed',
            'deleted',
        ]),
        friendlyGitName() {
            if (!this.remote_url) return "";
            else
                return this.remote_url
                .replace(".git", "")
                .replace("git@github.com:", "");
        },
        changeCount() {
            return this.modified.length + this.added.length + this.deleted.length + this.conflicts.length + this.renamed.length;
        },
    },
    methods: {
        toggleDialog() {
            const dialog = this.dialog;
            if (!dialog) {
                return this.$emit('close');
            }
        },
        confirm() {
            this.commiting = true;
            if (this.comment) {
                this.$store.dispatch('ide/commitUserBranch', {
                    commit_message: this.comment
                }).then(() => {
                    this.commiting = false;
                    this.$emit('refreshAll');
                    this.close();
                }).catch(error => {
                    console.error(error);
                    this.close();
                    this.commiting = false;
                })
            }
        },
        close() {
            this.dialog = false;
            return this.$emit('close');
        },
    }
}
</script>

<style lang='less'>
    .modified-files {
        max-height: 180px;
        overflow-y: auto;
        font-size: 12px !important;
        i {
            font-size: 16px !important;
        }
        
    }
</style>
