<template>
    <div class="git-manager-sidebar">
        <multipane class="vertical-panes" @paneResizeStop='(...args) => this.$emit("sizeChanged", ...args)'>
            <v-navigation-drawer
                :width="containerSizes.sidebar"
                class="navigation-files-drawer"
                background="#264653"
                permanent
            >
                <v-list-item-title class="list-title top-gap">GIT ACTIONS</v-list-item-title>
                <v-divider class="pb-2"></v-divider>
                <v-item-group class="mt-3">
                    <v-list-item-subtitle class="pl-2">Current Branch</v-list-item-subtitle>
                    <div class="d-flex justify-content-between align-center">
                        <v-tooltip right>
                            <template v-slot:activator="{ on, attrs }">
                                <v-select
                                    class="mt-3"
                                    outlined
                                    :items='branches || []'
                                    v-model="currentBranch"
                                    @change='changeBranch'
                                    v-bind="attrs"
                                    v-on="on"
                                    dense
                                    :disabled='switchingBranch || branchLoading || reverting'
                                >
                                </v-select>
                            </template>
                            <span>Warning: Any local Git changes will be lost</span>
                        </v-tooltip>
                        <v-icon :disabled='reverting' :class="{'spinner-loader': reloadingBranches || switchingBranch || branchLoading}" @click='reloadBranches' class="mb-4 ml-2 default-icon-size cursor-pointer">
                            mdi-{{ reloadingBranches || switchingBranch ? 'loading' : 'reload' }}
                        </v-icon>
                    </div>
                    <div
                        :class="{'faded-text': changeCount < 1}"
                        class="cursor-pointer git-control"
                        @click='viewUncomittedChanges'
                    >
                        <span>View Uncomitted Changes</span>
                        <v-icon v-if='gettingChanges' class="spinner-loader">mdi-loading</v-icon>
                    </div>
                    <!-- <div class="cursor-pointer git-control my-5">Commit History</div> -->
                    <div
                        class="cursor-pointer git-control my-5 mb-5"
                        :class="{'faded-text': reverting}"
                        @click='commitChanges'
                        
                    >
                        <span>{{buttonLabel}}</span>
                        <v-icon class="spinner-loader" v-if='comitting'>mdi-loading</v-icon>
                        <br>
                        <small>
                            <span v-if="buttonLabel == 'Commit Changes' && !conflicts.length">{{ changeCount || 0 }} File{{ changeCount > 1 ? 's' : '' }}</span>
                            <span v-if="buttonLabel == 'Commit Changes' && conflicts.length">
                                {{ conflicts.length }} merge conflict{{ conflicts.length > 1 ? 's' : ''}}
                            </span>
                            <span v-if="buttonLabel == 'Pull Remote'">
                                {{ commits_behind }} commit{{ commits_behind > 1 ? 's' : ''}} behind master
                            </span>
                            <span v-if="buttonLabel == 'Push to Production' || buttonLabel == 'Merge to Master'">
                                {{ commits_ahead }} commit{{ commits_ahead > 1 ? 's' : ''}} ahead of master
                            </span>
                            <span v-if="buttonLabel === 'No Changes'">Nothing to commit</span>
                        </small>
                    </div>
                </v-item-group>
                <div class="spacer-div"></div>
                <v-item-group>
                    <div :class="{'faded-text': reverting}" class="cursor-pointer git-control my-5" @click='modals.pull = !reverting'>
                        <span>Pull branch</span>
                        <v-icon v-if='pullingBranch' class="spinner-loader">mdi-loading</v-icon>
                    </div>
                    <div :class="{'faded-text': reverting}" class="cursor-pointer git-control my-5" @click='modals.revert = !reverting'>
                        <span>Revert Local Changes</span>
                        <v-icon v-if='reverting' class="spinner-loader">mdi-loading</v-icon>
                    </div>
                </v-item-group>
                <div class="spacer-div"></div>
                <v-item-group>
                    <div @click="testGitConnection" class="cursor-pointer git-control my-5">
                        <span>Test Git Connection</span>
                        <v-icon v-if='testing' class="spinner-loader">mdi-loading</v-icon>
                        <br>
                        <small>{{ testResult }}</small>
                    </div>
                </v-item-group>
            </v-navigation-drawer>
            <multipane-resizer></multipane-resizer>
        </multipane>
        <confirm-modal
            message='Do you want to pull branch from remote?'
            :show='modals.pull'
            v-if='modals.pull'
            @close='modals.pull = false'
            @confirm='pullBranch'
        />
        <confirm-modal
            message='Do you want to revert all local changes? This cannot be undone.'
            :show='modals.revert'
            v-if='modals.revert'
            @close='modals.revert = false'
            @confirm='revertBranch'
        />
        <commit-modal
            :hideAction='hideAction'
            :show='commitModal'
            @close='commitModal = false'
            v-if='commitModal'
            @refreshAll='$emit("reloadEverything")'
        />
    </div>
</template>

<script>
import { mapState } from 'vuex'
import ConfirmModal from '../../common/ConfirmModal';
import CommitModal from '../CommitModal';
import FullScreenLoader from '../../common/FullScreenLoader';
import { Multipane, MultipaneResizer } from 'vue-multipane';

export default {
    data: () => ({
        modals: {
            pull: false,
            revert: false,
        },
        reverting: false,
        pullingBranch: false,
        gettingChanges: false,
        commitModal: false,
        hideAction: false,
        comitting: false,
        testing: false,
        testResult: '',
        tempBranch: '',
        switchingBranch: false,
        loadingMessage: '',
        reloadingBranches: false,
    }),
    components: {
        ConfirmModal,
        CommitModal,
        FullScreenLoader,
        Multipane,
        MultipaneResizer,
    },
    computed: {
        ...mapState('git', [
            'branches',
            'current_branch',
            'app_mode',
        ]),
        ...mapState('ide', [
            'modified',
            'added',
            'deleted',
            'conflicts',
            'renamed',
            'commits_behind',
            'commits_ahead',
            'branchLoading',
            'containerSizes'
        ]),
        currentBranch: {
            get() {
                this.tempBranch = this.current_branch;
                return this.current_branch;
            },
            set(value) {
                this.tempBranch = value;
                return value;
            }
        },
        changeCount() {
            return this.modified.length + this.added.length + this.deleted.length + this.conflicts.length + this.renamed.length;
        },
        buttonLabel() {
            if (this.changeCount > 0) return "Commit Changes"
            else if (this.commits_behind) return "Pull Remote";
            else if (this.commits_ahead && this.app_mode == 'wld') return "Push to Production";
            else if (this.commits_ahead && this.app_mode == 'sqlide') return "Merge to Master";
            else return "No Changes";
        },
    },
    methods: {
        changeBranch() {
            this.switchingBranch = true;
            this.loadingMessage = 'Switching Branch';
            this.$store.dispatch('git/toggleReloadingGit', true);
            this.$store.dispatch('git/changeBranch', {
                branch: this.tempBranch,
            }).then(() => {
                this.loadingMessage = 'Reloading Branches';
                this.$store.dispatch('ide/resetVariables');
                this.$store.dispatch('ide/getDag')
                    .then(() => {
                        this.switchingBranch = false;
                    })
                    .catch(error => {
                        console.error(error);
                        this.switchingBranch = false;
                    });
                this.$emit('reloadEverything');
            }).catch(error => {
                this.switchingBranch = false;
                console.log(error);
                this.$alert({ message: 'Failed to switch branch', type: 'error' });
            })
        },
        viewUncomittedChanges() {
            if (this.changeCount) {
                this.hideAction = true;
                this.gettingChanges = true;
                this.getBranchStatus();
            }
        },
        commitChanges() {
            if (this.reverting) return false;
            this.comitting = true;
            if (this.changeCount > 0) {
                this.hideAction = false;
                this.getBranchStatus();
            } else if (this.commits_behind) {
                this.pullOriginBranch();
            } else if (this.commits_ahead) {
                this.deployUserBranch();
            } else {
                this.comitting = false;
            }
        },
        testGitConnection() {
            this.testing = true;
            this.$store.dispatch('git/getGitConfig', 'filetree')
                .then((response) => {
                    const active = response.data.status === 'success';
                    this.testResult = active ? 'Connection working!' : 'Connection not working!';
                    this.testing = false;
                }).catch(error => {
                    console.log(error);
                    this.testResult = 'Connection not working!';
                    this.testing = false;
                });
        },
        getBranchStatus(testing = false) {
            this.testing = testing;
            this.$store.dispatch('ide/getBranchStatus')
                .then(() => {
                    this.commitModal = !testing;
                    this.gettingChanges = false;
                    this.comitting = false;
                    if (testing) {
                        this.testResult = 'Connection working!';
                        this.testing = false;
                    }
                }).catch(error => {
                    console.log(error);
                    this.gettingChanges = false;
                    this.comitting = false;
                    if (testing) {
                        this.testResult = 'Connection not working!';
                        this.testing = false;
                    }
                });
        },
        pullOriginBranch() {
            this.$store.dispatch('git/pullOriginBranch')
                .then(() => {
                    this.comitting = false;
                    this.$emit('reloadEverything');
                    this.$emit('reloadOpenFiles');
                }).catch(error => {
                    this.comitting = false;
                    console.log(error);
                })
        },
        pullBranch() {
            this.pullingBranch = true;
            this.$store.dispatch('git/pullBranch', {})
                .then(() => {
                    this.pullingBranch = false;
                    this.$emit('reloadEverything');
                }).catch(error => {
                    this.pullingBranch = false;
                    this.$emit('reloadEverything');
                    console.log(error);
                })
        },
        revertBranch() {
            this.reverting = true;
            this.$store.dispatch('git/toggleReloadingGit', true);
            this.$store.dispatch('git/revertBranch', {})
                .then(() => {
                    this.reverting = false;
                    this.$emit('reloadEverything');
                    this.$store.dispatch('ide/addBuildErrors', []);
                }).catch(error => {
                    this.reverting = false;
                    this.$emit('reloadEverything');
                    console.log(error);
                })
        },
        reloadBranches() {
            this.reloadingBranches = true;
            this.$store.dispatch('git/reloadBranches')
                .then(() => {
                    this.reloadingBranches = false;
                }).catch(error => {
                    console.error(error);
                    this.reloadingBranches = false;
                });
        }
    },
}
</script>

<style lang="less" src='../../../assets/styles/ideSidebarSection.less'></style>