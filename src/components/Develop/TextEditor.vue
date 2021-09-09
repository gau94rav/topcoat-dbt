<template>
    <div class="text-editor-section outline">
        <v-icon v-if='loadingFile' class="spinner-loader file-loader">mdi-loading</v-icon>
        <div class="text-editor" v-if="openFiles.length && !loadingFile">
            <div class="image-container" v-if='$isImage(fileKey)'>
                <img style="padding: 30px;" :src="`${static_app_prefix}/${fileKey.substring(8)}`">
            </div>
            <develop-monaco-pane v-else />
        </div>
            <div
                class="ide-controls d-flex align-end justify-end"
                v-if='fileKey && !loadingFile && !$isImage(fileKey)'
            >
                <v-btn :disabled='executingQuery' @click='$emit("executeQuery")' elevation="0" color="#2a9d8f" class="run-btn" v-if='$getLanguage(fileKey) === "sql"'>
                    <span>Run</span>
                    <v-icon :class='{"spinner-loader": executingQuery}' class="ide-action-icon">mdi-{{ !executingQuery ? 'chevron-double-right' : 'loading' }}</v-icon>
                </v-btn>
                <v-btn v-if='!readOnly' :disabled='saving' elevation="0" color="rgba(42, 157, 143, 0.08)" class="save-btn" @click="saveFile">
                    <span>Save</span>
                    <v-icon class="ide-action-icon" :class="{'spinner-loader': saving}">
                        mdi-{{ saving ? 'loading' : 'content-save-outline' }}
                    </v-icon>
                </v-btn>
            </div>
    </div>
</template>

<style lang="less">
.text-editor-section {
    position: relative;
    min-width: 350px !important;
    .file-loader {
        position: absolute !important;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
    }
    .text-editor {
        overflow: hidden;
        height: 100%;
        position: relative;
        .image-container {
            height: 100%;
            overflow: auto;
            img {
                width: max-content;
                height: max-content;
            }
        }
    }
        .ide-controls {
            // margin-right: 50px;
            position: relative;
            width: max-content;
            float: right;
            z-index: 10;
            position: absolute;
            right: 17px;
            bottom: 10px;
            margin: auto;
            .v-btn {
                width: 100px;
                height: 37.9px !important;
                font-size: 12px !important;
                font-family: 'Montserrat-Medium';
                text-transform: none;
                margin: 0 10px;
                .ide-action-icon {
                    position: relative;
                    left: 10px;
                }
            }
            .save-btn {
                color: #2a9d8f !important;
            }
            .run-btn {
                color: #fff !important;
            }
        }
}
</style>

<script>
import { mapState } from 'vuex';
import { eventBus } from '../../main';
import DevelopCodemirrorPane from './DevelopCodemirrorPane';
import DevelopMonacoPane from './DevelopMonacoPane';

export default {
    components: {
        DevelopCodemirrorPane,
        DevelopMonacoPane,
    },
    data: () => ({
        saving: false,
        keys: {
            17: false,
            83: false,
        },
    }),
    mounted() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        this.getStaticAppPrefix();
    },
    computed: {
        ...mapState('ide', [
            'openFiles',
            'selectedIndex',
            'static_app_prefix',
            'containerSizes',
            'executingQuery',
            'loadingFile',
        ]),
        currentLayer() {
            if (this.openFiles[this.selectedIndex].key) {
            const file_path = this.openFiles[this.selectedIndex].key.replace('F/layers/','').split('.')[0].split('/')
            return file_path[file_path.length-1];
            } else return null;
        },
        fileKey() {
            const file = this.openFiles[this.selectedIndex];
            return file ? file.key : '';
        },
        readOnly() {
            const file = this.openFiles[this.selectedIndex];
            if (file) {
                const key = file.key || '';
                if (key.includes('dbt_gen') || key.includes('modules')) return true;
            }
            return false;
        }
    },
    destroyed() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    },
    methods: {
        getStaticAppPrefix() {
            this.$store.dispatch('ide/getStaticAppPrefix')
                .catch(error => {
                    console.log(error);
                });
        },
        isSqlOrJson(key) {
            return this.$getLanguage(key) === 'sql' || 
                this.$getLanguage(key) === 'json';
        },
        saveFile() {
            if (this.saving) return false;
            const file = this.openFiles[this.selectedIndex];
            const contents = file.contents;
            if (this.saving) return false;
            this.saving = true;
            this.$store.dispatch('ide/saveFileContents', {
                file_name: `/${this.fileKey.substring(2)}`,
                contents
            }).then(response => {
                this.updateFileAttribute(file.key, 'changes', false);
                this.updateFileAttribute(file.key, 'queryErrors', response.data.errors);
                this.getDag();
                this.ifErrors(response.data.errors, file);
                this.getBranchStatus();

                // Note: this notifies DevelopMonacoPane, to reload current file's completion items (e.g. file variables from query text)
                eventBus.$emit('fileSaved', this.selectedIndex);
            }).catch(error => {
                this.saving = false;
                console.log(error);
            })
        },
        updateFileAttribute(key, attribute, value) {
            this.$store.dispatch('ide/openFileAtrribute', {
                key,
                attribute,
                value,
            })
        },
        getDag() {
            this.$store.dispatch('ide/getDag')
                .catch(error => {
                    console.log(error);
                    this.saving = false;
                });
        },
        ifErrors(errors, file) {
            if (errors.length) {
                this.updateFileAttribute(file.key, 'activeResultsTab', 'results');
                this.updateFileAttribute(file.key, 'queryResults', null);
            }
            this.saving = false;
        },
        handleKeyDown(e) {
            if (e.keyCode in this.keys) {
                this.keys[e.keyCode] = true;
                if (e.metaKey) {
                    this.keys[17] = true;
                }
                if (this.keys[17] && this.keys[83]) {
                    this.saveFile();
                }
            }
        },
        getBranchStatus() {
            this.$store.dispatch('ide/getBranchStatus')
                .catch(error => console.log(error));
        },
        handleKeyUp() {
            this.keys[17] = false;
            this.keys[83] = false;
        },
    }
}
</script>