<template>
    <div class="dbt-section">
        <multipane class="vertical-panes" @paneResizeStop='(...args) => this.$emit("sizeChanged", ...args)'>
            <v-navigation-drawer
                :width="containerSizes.sidebar"
                class="navigation-files-drawer"
                background="#264653"
                permanent
            >
                <v-item-group class="d-flex justify-space-between align-center top-gap">
                    <v-list-item-title class="list-title">MODELS</v-list-item-title>
                    <v-icon
                        class="cursor-pointer default-icon-size"
                        :class="{'spinner-loader': reloading}"
                        @click='refreshRefs'
                    >
                        mdi-{{ reloading ? 'loading' : 'reload' }}
                    </v-icon>
                </v-item-group>
                <div class="spacer-div mb-3"></div>
                <small v-if='!refs_tree || !refs_tree.length'>No models found</small>
                <v-treeview
                    v-if='refs_tree'
                    open-on-click
                    :items='refs_tree'
                    :open.sync='opened'
                    item-key="key"
                >
                    <template v-slot:append="{ item }">
                        <v-icon
                            style='padding: 2px'
                            class="square-btn ref-add-btn ml-3"
                            v-if='openFiles.length &&
                            openFiles[selectedIndex].key !== item.key && 
                            $getLanguage(openFiles[selectedIndex].key) === "sql" &&
                            item.type !== "folder"'
                            @click='addKey($event, item.key)'
                        >
                            mdi-code-braces
                        </v-icon>
                    </template>
                    <template #label='{item}'>
                        <div
                            @mouseenter="toggleData($event, item)"
                            @mouseleave="toggleData($event, null)"
                            class="file-name">
                            <div>
                                {{ item.title }}
                            </div>
                        </div>
                    </template>
                </v-treeview>
            </v-navigation-drawer>
            <multipane-resizer></multipane-resizer>
        </multipane>
        <popover
            v-if="Object.keys(toggle).length"
            :show='toggle'
            :top='popoverPosition.y'
            :left='`${parseInt(containerSizes.sidebar.replace("px", "")) + 65}px`'
        >
            <div class="flex-column" style="font-size: 12px">
                <div class="d-flex py-1">
                    <div class="dbt-title">Materialized: &nbsp;</div>
                    <v-chip color="blue" label outlined>
                        {{ toggle.dbt.config.materialized }}
                    </v-chip>
                </div>
                <div class="d-flex py-1">
                    <div class="dbt-title">Model: &nbsp;</div>
                    <div class="dbt-desc">{{ toggle.title }}</div>
                </div>
                <div class="d-flex py-1">
                    <div class="dbt-title">Database: &nbsp;</div>
                    <div class="dbt-desc">{{ toggle.dbt.database }}</div>
                </div>
            </div>
        </popover>
    </div>
</template>

<style lang="less" src='../../assets/styles/ideSidebarSection.less'></style>
<style lang="less">
    .dbt-section {
        .v-chip {
            height: max-content;
            position: relative;
            bottom: 4px;
            span {
                font-size: 12px;
            }
        }
        .dbt-title {
            font-family: 'Montserrat-Regular';
        }
        .dbt-desc {
            font-family: 'Montserrat-Medium';
        }
    }
</style>

<script>
import { mapState } from 'vuex';
import Popover from '../common/Popover';
import { Multipane, MultipaneResizer } from 'vue-multipane';
import { eventBus } from '../../main';

export default {
    data: () => ({
        reloading: false,
        toggle: {},
        popoverPosition: {
            x: 0,
            y: 0,
        },
    }),
    components: {
        Popover,
        Multipane,
        MultipaneResizer,
    },
    computed: {
        ...mapState('dbt', [
            'refs_tree',
            'openedFolders',
        ]),
        ...mapState('ide', [
            'openFiles',
            'selectedIndex',
            'containerSizes',
        ]),
        opened: {
            get() {
                return this.openedFolders;
            },
            set(ids) {
                if (ids && ids.length) this.$store.dispatch('dbt/updateFileTree', ids);
                return ids;
            }
        }
    },
    mounted() {
        this.getRefs();
    },
    methods: {
        addKey(e, key) {
            e.stopPropagation();
            eventBus.$emit("cm_add_text", "{{ ref('" + key + "') }}");
        },
        toggleData(e, file) {
            if (file && !file.type) {
                this.popoverPosition.x = e.clientX + 'px';
                this.popoverPosition.y = (e.clientY - 20) + 'px';
                return this.toggle = file;
            }
            return this.toggle = {};
        },
        getRefs() {
            const tree = this.refs_tree;
            if (tree && tree.length) return;

            this.reloading = true;
            this.$store.dispatch('dbt/getDbtRefs')
                .then(() => {
                    this.reloading = false;
                })
                .catch(error => {
                    this.reloading = false;
                    console.log(error);
                });
        },
        refreshRefs() {
            this.reloading = true;
            this.$store.dispatch('dbt/resyncDbt')
                .then(() => {
                    this.reloading = false;
                }).catch(error => {
                    console.log(error);
                    this.reloading = false
                })
        }
    }
}
</script>