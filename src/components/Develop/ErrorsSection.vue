<template>
    <div
        class="errors-container"
        :style='{height: !isSqlFile ? "calc(100% - 70px)" : "100%"}'
    >
        <div class="errors-content">
            <div class="errors-header d-flex justify-space-between px-4">
                <div class="errors-title">Code Validation</div>
                <v-icon class="cursor-pointer" @click='closeSection'>mdi-close</v-icon>
            </div>
            <div class="errors-body">
                <div class="errors-title-container mt-8 d-flex px-4">
                    <v-icon v-if='!building' class="error-icon" :color="errors.length ? '#e76f51' : '#18a476'">
                        mdi-{{ errors.length ? 'alert-circle' : 'check-circle' }}
                    </v-icon>
                    <div class="errors-title ml-2" v-if="errors.length">{{ errors.length || 0 }} error{{ errors.length > 1 ? 's' : '' }} found</div>
                    <div class="errors-title ml-2" v-else>{{ building ? 'Building...' : 'No errors found' }}</div>
                </div>
                <div class="errors-list mt-4" v-if='errors'>
                    <div
                        class="errors-list-item py-4 cursor-pointer"
                        v-for='(error, index) in errors'
                        :key='index'
                        @click='switchTab(error.path)'
                    >
                        <div class="error-header d-flex px-4">
                            <div class="error-title error-text">Error: </div>
                            <div class="error-file ml-3">{{ error.path }}</div>
                        </div>
                        <div class="error-body px-4 py-2">
                            {{ error.message }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
    computed: {
        ...mapState('ide', [
            'openFiles',
            'selectedIndex',
            'buildErrors',
            'building',
            'file_tree',
            'all_files',
        ]),
        errors() {
            const bErrors = this.buildErrors || {};
            const keys = Object.keys(bErrors);
            const errors = [];
            for (let key of keys) {
                const error = {
                    path: key,
                    message: bErrors[key]
                }
                errors.push(error);
            }
            return errors;
        },
        isSqlFile() {
            const file = this.openFiles[this.selectedIndex];
            if (file) {
                return this.$getLanguage(file.key) === 'sql';
            }
            return false;
        }
    },
    methods: {
        switchTab(path) {
            const originalPath = `F/${path}`;
            const tabPath = `tab-F/${path}`;
            const file = this.$extractFilesByType(this.all_files, originalPath, false)[0];
            if (file) {
                this.$store.dispatch('ide/loadFile', {
                    file,
                    instance: this,
                    selectTab: tabPath
                });
            }            
        },
        closeSection() {
            this.$store.dispatch('ide/toggleErrorSection', false);
        }
    }
}
</script>

<style lang="less">
    .errors-container {
        padding-bottom: 15px;
        overflow: auto;
        background: #fff;
        z-index: 8;
        border-left: 1px solid #e5e7eb !important;
        .errors-content {
            .errors-header {
                position: sticky;
                padding-top: 15px;
                top: 0;
                margin: auto;
                z-index: 10;
                background: #fff;
                .errors-title {
                    font-family: "Montserrat-Medium";
                    font-size: 16px;
                }
            }
            .errors-body {
                .errors-title-container {
                    font-family: "Montserrat-Regular";
                    font-size: 14px;
                    .error-icon {
                        font-size: 18px;
                    }
                }
                .errors-list {
                    overflow: auto;
                    .errors-list-item {
                        border-bottom: 1px solid #e5e7eb;
                        &:hover {
                            background: #fff9f9;
                        }
                        .error-header {
                            .error-title {
                                font-family: "Montserrat-Regular";
                                font-size: 14px;
                            }
                            .error-file {
                                font-family: "OpenSans-Regular";
                                font-size: 14px;
                            }
                        }
                        .error-body {
                            font-family: "OpenSans-Regular";
                            font-size: 11px;
                        }
                    }
                }
            }
        }
    }

    @media (max-width: 1024px) {
        .errors-container {
            width: 100% !important;
            position: absolute;
        }
    }
</style>