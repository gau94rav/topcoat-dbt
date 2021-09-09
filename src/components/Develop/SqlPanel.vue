<template>
    <div class="sql-panel-container mt-2">
        <div class="sql-panel-content" :class="{'overflow-auto': errors && errors.length}">
            <div class="sql-panel-header">
                <div class="tabs d-flex">
                    <v-tabs v-model="activeTab">
                        <v-tab
                            href="#tab-results"
                            :disabled="(!openFiles[selectedIndex].queryResults && !renderContents)"
                            @mouseenter="setColor('results', true)"
                            @mouseleave="setColor('results', false)"
                        >
                            <four-squares :color='color.results' />
                            <div
                                :style='{color: color.results}'
                                class="tab-text pl-2 desktop-element">
                                <div>Results <span v-if='rows && rows.length'>({{ rows.length }})</span></div>
                            </div>
                        </v-tab>
                        <v-tab
                            :disabled="!renderContents"
                            href="#tab-sql"
                            @mouseenter="setColor('sql', true)"
                            @mouseleave="setColor('sql', false)"
                        >
                            <sql-icon :color='color.sql' />
                            <div
                                :style='{color: color.sql}'
                                class="tab-text pl-2 desktop-element">
                                SQL
                            </div>
                        </v-tab>
                        <v-tab
                            href="#tab-visualize"
                            :disabled="!openFiles[selectedIndex].queryResults"
                            @mouseenter="setColor('visualize', true)"
                            @mouseleave="setColor('visualize', false)"
                        >
                            <visualize-icon :color='color.visualize' />
                            <div
                                :style='{color: color.visualize}'
                                class="tab-text pl-2 desktop-element">
                                Visualize
                            </div>
                        </v-tab>
                        <v-tab
                            href="#tab-lineage"
                            :disabled="!layer_dags[currentLayer] || errors.length > 0"
                            @mouseenter="setColor('lineage', true)"
                            @mouseleave="setColor('lineage', false)"
                        >
                            <lineage-icon :color='color.lineage' />
                            <div
                                :style='{color: color.lineage}'
                                class="tab-text pl-2 desktop-element">
                                Lineage
                            </div>
                        </v-tab>
                        <!-- Todo: change disable reason if needed -->
                        <v-tab
                            href="#tab-figure"
                            :disabled="!openFiles[selectedIndex].queryResults"
                            @mouseenter="setColor('figure', true)"
                            @mouseleave="setColor('figure', false)"
                        >
                            <v-icon class="sql-panel-v-icon" :color="color.figure">mdi-code-json</v-icon>
                            <div
                                :style='{color: color.figure}'
                                class="tab-text pl-2 desktop-element">
                                Figure
                            </div>
                        </v-tab>
                    </v-tabs>
                    <div class="sql-panel-controls d-flex">
                        <div class="rows">{{ rows.length }} Total row{{ rows.length > 1 ? 's' : '' }}</div>
                        <div class="download-icon sql-icon cursor-pointer mx-4" @click='downloadCSV'>
                            <download-icon v-if='!downloading' color='#2a9d8f' />
                            <v-icon class="spinner-loader" v-else>mdi-loading</v-icon>
                        </div>
                        <div class="reload-icon sql-icon cursor-pointer" @click='$emit("executeQuery")'>
                            <reload-icon v-if='!executing' color='#2a9d8f' />
                            <v-icon class="spinner-loader" v-else>mdi-loading</v-icon>
                        </div>
                        <div class="preview-icon sql-icon cursor-pointer mx-4">
                            <a :href="'/layers/' + currentLayer" target="_blank">
                                <v-icon size='19' color='#2a9d8f'>mdi-monitor-dashboard</v-icon>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="sql-panel-body mt-2" v-if='errors && !errors.length'>
                <div v-if='activeTabWithoutPrefix === "results"'>
                    <v-data-table
                        class="elevation-0"
                        :headers='columns'
                        :items='rows'
                        :height='(containerSizes.sqlHeight.replace("px", "") - 50) + "px"'
                        hide-default-footer
                        :items-per-page="10"
                        @page-count="pageCount = $event"
                        :page.sync="page"
                    />
                    <v-pagination
                        class="mt-3"
                        v-model="page"
                        color="#2a9d8f"
                        :length="pageCount"
                        :total-visible="5"
                    ></v-pagination>
                </div>
                <div class="outline section" v-if='activeTabWithoutPrefix === "sql"'>
                    <codemirror
                        :value="renderContents"
                        :options="{
                            mode: { name: 'text/x-sql' },
                            theme: 'default',
                            lineNumbers: true,
                            lineWrapping: true,
                            line: true,
                            readOnly: true,
                        }"
                        :style='{height: containerSizes.sqlHeight}'
                    />
                </div>
                <div class="section" v-if='activeTabWithoutPrefix ===  "visualize"'>
                    <visualize :style='{height: containerSizes.sqlHeight}' v-if='openFiles[selectedIndex].visualize' :index='selectedIndex' />
                </div>
                <div>
                    <Dag
                        v-if='activeTabWithoutPrefix === "lineage"'
                        :key="dag_update_time"
                        :dag="layer_dags[currentLayer]"
                        :layer="currentLayer"
                        :style='{height: containerSizes.sqlHeight}'
                    />
                </div>
                <div class="outline section" v-if='activeTabWithoutPrefix === "figure"'>
                    <codemirror
                        :value="figure"
                        :style='{height: containerSizes.sqlHeight}'
                        :options="{
                            mode: { name: 'text/x-sql' },
                            theme: 'default',
                            lineNumbers: true,
                            lineWrapping: true,
                            line: true,
                            readOnly: true
                        }"
                    />
                </div>
            </div>
            <sql-errors v-else class="pt-3" />
            <div class="sql-panel-foot"></div>
        </div>
    </div>
</template>

<script>
import FourSquares from '../common/ComponentIcons/FourSquares';
import SqlIcon from '../common/ComponentIcons/SqlIcon';
import VisualizeIcon from '../common/ComponentIcons/VisualizeIcon';
import LineageIcon from '../common/ComponentIcons/LineageIcon';
import DownloadIcon from '../common/ComponentIcons/DownloadIcon';
import ReloadIcon from '../common/ComponentIcons/ReloadIcon';
import { mapState } from 'vuex';
import Visualize from './Visualize';
import Dag from './Dag';
import SqlErrors from './SqlErrors';

export default {
    data: () => ({
        activeTabWithoutPrefix: '',
        color: {
            results: '#7f8798',
            sql: '#7f8798',
            visualize: '#7f8798',
            lineage: '#7f8798',
            figure: '#7f8798'
        },
        downloading: false,
        page: 1,
        pageCount: 0,
        figure: JSON.stringify({}, null, "\t")
    }),
    mounted() {
        if (this.activeSqlTab) {
            this.setColor(this.activeSqlTab.replace('tab-', ''));
        }
    },
    computed: {
        activeTab: {
            get() {
                this.setActive(this.activeSqlTab);
                return this.activeSqlTab;
            },
            set(tab) {
                this.$store.dispatch('ide/activeTab', tab || '');
                this.setActive(tab || '');
                return tab || '';
            }
        },
        ...mapState('ide', [
            'openFiles',
            'selectedIndex',
            'layer_dags',
            'dag_update_time',
            'activeSqlTab',
            'containerSizes',
            'reloadingQuery',
        ]),
        errors() {
            const file = this.openFiles[this.selectedIndex];
            return file ? file.queryErrors : [];
        },
        columns() {
            const file = this.openFiles[this.selectedIndex];
            const queryResults = file ? file.queryResults : [];
            const columns = [];
            if (queryResults && queryResults.length) {
                const queryColumns = Object.keys(queryResults[0]);
                for (let column of queryColumns) {
                    if (column === '_index') continue;
                    columns.push({
                        text: column,
                        value: column
                    });
                }
            }
            return columns;
        },
        rows() {
            const file = this.openFiles[this.selectedIndex];
            const queryResults = file ? file.queryResults : [];
            const rows = [];
            let columns = [];
            if (this.activeSqlTab) {
                this.setColor(this.activeSqlTab.replace('tab-', ''));
            }
            if (queryResults && queryResults.length) {
                const queryData = queryResults;
                for (let data of queryData) {
                    columns = !columns.length ? Object.keys(data) : columns;
                    let rowObject =  {};
                    for (let column of columns) {
                        if (column === '_index') continue;
                        rowObject[column] = data[column].rendered;
                    }
                    rows.push(rowObject);
                }
            }
            return rows;
        },
        renderContents() {
            if (this.openFiles && this.selectedIndex != null) return this.openFiles[this.selectedIndex].rendered_sql;
            else return '';
        },
        currentLayer() {
            if (this.openFiles[this.selectedIndex].key) {
            const file_path = this.openFiles[this.selectedIndex].key.replace('F/layers/','').split('.')[0].split('/')
            return file_path[file_path.length-1];
            } else return null;
        },
        executing() {
            return this.reloadingQuery;
        }
    },
    components: {
        FourSquares,
        SqlIcon,
        VisualizeIcon,
        LineageIcon,
        DownloadIcon,
        ReloadIcon,
        Visualize,
        Dag,
        SqlErrors
    },
    methods: {
        setActive(tab) {
            tab = tab.replace('tab-', '');
            this.color[this.activeTabWithoutPrefix] = '#7f8798';
            this.activeTabWithoutPrefix = tab;
            const key = this.openFiles[this.selectedIndex].key;
            if (tab === 'visualize') {
                return this.$store.dispatch('ide/openFileAtrribute', {key, attribute: tab, value: true});
            }
            return this.$store.dispatch('ide/openFileAtrribute', {key, attribute: tab, value: false});
        },
        setColor(section, active) {
            if (active) {
                return this.color[section] = '#2a9d8f';
            }
            return this.color[section] = this.activeTabWithoutPrefix !== section ? '#7f8798' : '#2a9d8f';
        },
        downloadCSV() {
            const key = this.openFiles[this.selectedIndex].key;
            const payload = {
                sql: this.openFiles[this.selectedIndex].contents,
                path: key.replace('F/layers/',''),
                filters: this.openFiles[this.selectedIndex].filter_overrides,
                attributes: this.openFiles[this.selectedIndex].attribute_overrides,
                origin: window.location.origin
            }

            const parts = key.split("/")
            const file = parts[parts.length-1].split('.')
            this.downloading = true;
            this.$store.dispatch('ide/downloadCSV', payload)
                .then(response => {
                    this.downloading = false;
                    const url = window.URL.createObjectURL(new Blob([response.data.csv]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', file[0].replace(/ /g, '') + '.csv'); //or any other extension
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }).catch(error => {
                    this.downloading = false;
                    this.$alert({message: 'Failed to download', type: 'error'});
                    console.log(error);
                })

        }
    },
}
</script>

<style lang="less">
    .sql-panel-container {
        font-family: 'Montserrat-Regular';
        .sql-panel-content {
            background: white;
            height: 100%;
            overflow: hidden;
            .sql-panel-v-icon {
                font-size: 18px;
            }
            .sql-panel-header {
                border: 1px solid #e5e7eb;
                position: sticky;
                top: 0;
                margin: auto;
                z-index: 10;
                .tabs {
                    position: relative;
                    z-index: 10;
                }
                .sql-panel-controls {
                    min-width: 180px;
                    display: flex;
                    align-items: center;
                    .rows {
                        color: #707070;
                        font-size: 12px;
                        display: flex;
                        flex: none;
                    }
                    .sql-icon {
                        background: #eaecf5;
                        height: 28px;
                        width: 28px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 3px;
                        border-radius: 3px;
                    }
                }
            }
            .sql-panel-body {
                overflow: auto;
                .v-data-table {
                    font-family: "Roboto-Medium";
                    border-radius: 2px;
                    border: 1px solid #e5e7eb;
                    overflow: auto;
                    td,
                    th {
                        height: 45px !important;
                    }
                    .v-data-table__wrapper {
                        overflow-y: auto !important;
                    }
                }
                .v-pagination__item {
                    box-shadow: none !important;
                    font-size: 14px !important;
                }
                .v-pagination__item--active {
                    width: 24px !important;
                }
            }
        }
        .v-tabs {
            width: max-content !important;
            .v-tab {
                background: #fff !important;
                font-family: 'Montserrat-Regular';
                width: 160px;
                text-transform: none !important;
                letter-spacing: 0px;
            }
            .v-tab--active {
                background: #f6f9fa !important;
                border-top: none !important;
            }
            .v-tabs-slider-wrapper {
                display: none;
            }
        }
    }

    @media (max-width: 1024px) {
        .sql-panel-container {
            .v-tabs {
                .v-tab {
                    width: 60px !important;
                    min-width: 60px !important;
                }
            }
            .v-slide-group__prev,
            .v-slide-group__next {
                display: none !important;
            }
        }
    }
</style>