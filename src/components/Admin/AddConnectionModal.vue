<template>
    <modal-template
        :title='modalTitle'
        :type='type'
        :disabled='disabled'
        :dialog='dialog'
        :loading='loading'
        :hideDefault='!connectionType'
        width='750'
        @toggleDialog='handleDialogTrigger'
        @confirm='save'
    >
        <div v-if='connectionType'>
            <div class="modal-form-section">
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input :disabled='loading || isYml' @input='checkValidation' :class="{'error-border': hasError('main', 'connectionName')}" id='name' v-model="connectionName" placeholder="Enter connection name" type='text' class="form-control" />
                </div>
            </div>
            <snow-flake-form
                v-if='connectionType === "snowflake"'
                :snowflakeConnection='snowflakeConnection'
                :errors='errors'
                @checkValidation='checkValidation'
                @updatedObject='snowflakeConnection = $event'
            />

            <big-query-form
                v-if='connectionType === "bigquery"'
                :bigqueryConnection='bigqueryConnection'
                :errors='errors'
                @checkValidation='checkValidation'
                @updatedObject='bigqueryConnection = $event'
            />

            <postgres-form
                v-if='connectionType === "postgres"'
                :postgresConnection='postgresConnection'
                :errors='errors'
                @checkValidation='checkValidation'
                @updatedObject='postgresConnection = $event'
            />

            <looker-api-form
                v-if='connectionType === "looker_api"'
                :looker_apiConnection='looker_apiConnection'
                :errors='errors'
                @checkValidation='checkValidation'
                @updatedObject='looker_apiConnection = $event'
            />

            <amazon-red-shift-form
                v-if='connectionType === "amazonRedShift"'
                :amazonRedShiftConnection='amazonRedShiftConnection'
                :errors='errors'
                @checkValidation='checkValidation'
                @updatedObject='amazonRedShiftConnection = $event'
            />

            <div v-if='testResponse' :class="testResponseType === 'error' ? 'error-message' : 'success-message'" class="test-message">
                <div class="d-flex justify-space-between align-items-center">
                    <div>{{ testResponse }}</div>
                    <v-icon class='cursor-pointer' @click='clearTestResponse'>mdi-close</v-icon>
                </div>
            </div>
        </div>

        <!-- Back Button -->
        <v-btn
            slot='foot-left'
            v-if='connectionType && type === "add"'
            class="outline"
            elevation="0"
            :disabled='loading'
            @click='reset'
            color="#e76f51"
        >
            <div class="d-flex align-center justify-space-around">
                <v-icon>mdi-arrow-left</v-icon>
                <div class="btn-label">Back</div>
            </div>
        </v-btn>
        <!-- Back Button -->

        <!-- Note: This feature is not ready in backend  -->
        <!-- Test Button -->
        <!-- <v-btn
            slot='foot-right'
            v-if='connectionType'
            class="outline modal-cancel-btn dark-text"
            elevation="0"
            width="100px"
            :disabled='loading'
            @click='testConnection'
        >
            <span v-if='!testing'>Test</span>
            <v-icon class="spinner-loader" v-else>mdi-loading</v-icon>
        </v-btn> -->
        <!-- Test Button -->
        <!-- Note: This feature is not ready in backend  -->

        <!-- Connection Grids -->
        <div v-if='!connectionType'>
            <div class="modal-grids-4 connection-btn-section">
                <div
                    :class="{'highlighted-border': connectionTypeTemp == item.id}"
                    class="square-box" @click="connectionTypeTemp = item.id"
                    v-for='(item, index) in connectionItems'
                    :key='index'
                >
                    <div class="square-label">
                        {{ item.label }}
                    </div>
                    <img :src='icons[item.icon]' />
                </div>
            </div>
        </div>
        <!-- Connection Grids -->

        <!-- Next Button -->
        <div slot='foot-right' v-if='!connectionType'>
            <v-btn
                class="modal-save-btn outline"
                elevation="0"
                width="100px"
                color="#2a9d8f"
                :disabled='!connectionTypeTemp'
                @click='setType'
            >
                <div class="d-flex align-center justify-space-around">
                    <div class="btn-label">Next</div>
                    <v-icon>mdi-arrow-right</v-icon>
                </div>
            </v-btn>
        </div>
        <!-- Next Button -->

    </modal-template>
</template>

<style lang="less">
    .connection-btn-section {
        .square-box {
            height: 160px !important;
            width: 160px;
            padding: 15px;
            .square-label {
                font-size: 12px;
                padding: 7px 0px;
            }
            img {
                width: 60px;
                height: auto;
            }
        }
    }
</style>

<script>
import ModalTemplate from './ConnectionForms/ModalTemplate';
import { mapState } from 'vuex';
import SnowFlakeForm from './ConnectionForms/SnowFlakeForm';
import BigQueryForm from './ConnectionForms/BigQueryForm';
import PostgresForm from './ConnectionForms/PostgresForm';
import LookerApiForm from './ConnectionForms/LookerApiForm';
import AmazonRedShiftForm from './ConnectionForms/AmazonRedShiftForm';
import '../../assets/snowflake.svg';
import '../../assets/bigquery.svg';
import '../../assets/postgres.svg';
import '../../assets/looker.svg';
import '../../assets/amazonRedShift.svg';
import { CONNECTION_LABELS } from '../../assets/constants/labels';
export default {
    props: ['type', 'disabled', 'editIndex'],
    components: {
        ModalTemplate,
        SnowFlakeForm,
        BigQueryForm,
        PostgresForm,
        LookerApiForm,
        AmazonRedShiftForm,
    },

    data: () => ({
        connectionTypeTemp: '',
        connectionType: '',
        connectionName: '',
        validated: false,
        connectionItems: [
            {id: 'snowflake', label: 'Snowflake', icon: 'snowflake'},
            {id: 'bigquery', label: 'Google BigQuery', icon: 'bigquery'},
            {id: 'postgres', label: 'PostgreSQL', icon: 'postgres'},
            {id: 'amazonRedShift', label: 'Amazon Redshift', icon: 'amazonRedShift'},
        ],
        snowflakeConnection: {
            type: "snowflake",
            account: '',
            password: '',
            username: '',
            warehouse: '',
            database: '',
            schema: ''
        },
        bigqueryConnection: {
            type: "bigquery",
            secret: '',
            dataset: '',
        },
        postgresConnection: {
            type: "postgres",
            host: '',
            port: '',
            username: '',
            password: '',
            database: '',
            ssl: false,
        },
        amazonRedShiftConnection: {
            type: "amazonRedShift",
            host: '',
            port: '',
            username: '',
            password: '',
            database: '',
            ssl: false,
        },
        looker_apiConnection: {
            host: '',
            port: '',
            database: '',
        },
        errors: {},
        typeValidate: false,
        loading: false,
        testResponse: '',
        testResponseType: '',
        testing: false,
        numberOnlyInputs: ['port'], // Workaround for non-chrome browsers
        dialog: false,
        isYml: false,
        connectionLabels: CONNECTION_LABELS,
    }),
    computed: {
        ...mapState('admin', [
            'connections',
            'updatingConnectionIndex',
        ]),
        icons() {
            return {
                snowflake: static_url + 'snowflake.svg',
                bigquery: static_url + 'bigquery.svg',
                postgres: static_url + 'postgres.svg',
                looker: static_url + 'looker.svg',
                amazonRedShift: static_url + 'amazonRedShift.svg',
            }
        },
        modalTitle() {
            let connectionName = CONNECTION_LABELS[this.connectionType];
            let title = '';
            if (connectionName) {
                title = this.type === "edit" ? `Edit ${connectionName} Connection` : `Add ${connectionName} Connection`
            } else {
                title = this.type === "edit" ? `Edit Connection` : `Add Connection`;
            }
            
            return title;
        },
        updatingIndex: {
            get() { return this.updatingConnectionIndex },
            set(val) {
                this.$store.dispatch('admin/updateConnectionIndex', val);
            }
        }
    },
    methods: {
        testConnection() {
            this.validate();
            if (!this.validated) return false;
            const type = this.connectionType;
            if (type) {
                const payload = this[`${type}Connection`];
                if (payload) {
                    this.testing = true;
                    payload.name = this.connectionName;
                    this.$store.dispatch('admin/testConnection', payload)
                        .then((response) => {
                            this.testing = false;
                            this.testResponseType = response.data.status || 'error';
                            this.testResponse = response.data.message || 'Test: Failed!'
                        }).catch(error => {
                            this.testing = false;
                            this.testResponseType = 'error';
                            this.testResponse = 'Test: Failed!'
                            console.error(error);
                        })
                }
            }
        },
        handleDialogTrigger(trigger) {
            if (!trigger) return this.dialog = false;
            this.dialog = true;
            if (!isNaN(this.editIndex) && this.editIndex > -1) {
                this.populateInputs();
            } else {
                this.reset();
            }
        },
        populateInputs() {
            this.errors = {};
            var connection = null;
            for (var i=0; i<this.connections.length; i++) {
                if (this.connections[i].connection_index == this.editIndex) {
                    connection = this.connections[i];
                    break;
                }
            }

            if (connection && connection !== 'undefined') {
                this.connectionType = connection.type;
                const type = `${connection.type}Connection`;
                const inputs = this[type];
                if (inputs && inputs !== 'undefined') {
                    this.originalName = connection.name;
                    this.connectionName = connection.name;
                    this.isYml = connection.yml || false;
                    for (let key of Object.keys(inputs)) {
                        if (key === 'type') continue;
                        this[type][key] = connection[key];
                    }
                }
                if (this[type]) {
                    if (Object.keys(this[type]).indexOf('password') > -1) {
                        // this[type]['password'] = '********';
                    } else if (Object.keys(this[type]).indexOf('password') > -1) {
                        if (!connection.secret) {
                            this[type]['secret'] = '*******************************************';
                        }
                    }
                }
                return true;
            }
            this.$alert({message: 'Connection type not found', type: 'error'});

            this.dialog = true;
        },
        reset() {
            this.connectionName = '';
            this.isYml = false;
            this.originalName = '';
            this.snowflakeConnection.account = '';
            this.snowflakeConnection.secret = '';
            this.snowflakeConnection.username = '';
            this.snowflakeConnection.warehouse = '';
            this.snowflakeConnection.database = '';
            this.snowflakeConnection.schema = '';
            this.bigqueryConnection.secret = '';
            this.bigqueryConnection.dataset = '';
            this.postgresConnection.secret = '';
            this.postgresConnection.host = '';
            this.postgresConnection.port = '';
            this.postgresConnection.username = '';
            this.postgresConnection.database = '';
            this.postgresConnection.ssl = false;
            this.amazonRedShiftConnection.secret = '';
            this.amazonRedShiftConnection.host = '';
            this.amazonRedShiftConnection.port = '';
            this.amazonRedShiftConnection.username = '';
            this.amazonRedShiftConnection.database = '';
            this.amazonRedShiftConnection.ssl = false;
            this.connectionType = '';
            // this.connectionTypeTemp = '';
            this.validated = false;
            this.typeValidate = false;
            this.errors = {};
            this.testResponse = '';
            this.dialog = true;
        },
        checkValidation(e) {
            this.allowNumbersOnly(e);
            if (!this.typeValidate) return false;
            this.validate(true);
        },
        allowNumbersOnly(e) {
            const id = e.target ? e.target.id : null;
            const value = e.target ? e.target.value : null;
            if (id && this.numberOnlyInputs.indexOf(id) > -1) {
                let currentType = `${this.connectionType}Connection`;
                if (this[currentType] && this[currentType][id] && isNaN(value)) {
                    this[currentType][id] = value.replace(/\D+/g, '');
                }
            }
        },
        hasError(connection, property) {
            return this.errors[connection] && this.errors[connection][property];
        },
        validate(checkOnly = false) {
            let errors = { main: {} };
            let type = `${this.connectionType}Connection`;
            if (!this.connectionName) errors.main.connectionName = true;
            switch (this.connectionType) {
                case 'snowflake':
                    errors = {...errors, [type]: this.validateSnowFlake()};
                    break;
                case 'bigquery':
                    errors = {...errors, [type]: this.validateBigquery()};
                    break;
                case 'postgres':
                    errors = {...errors, [type]: this.validatePostgres()};
                    break;
                case 'looker_api':
                    errors = {...errors, [type]: this.validateLooker()};
                    break;
                case 'amazonRedShift':
                    errors = {...errors, [type]: this.validateAmazonRedShift()};
                    break;
            }
            if (!checkOnly) {
                this.validated = errors[type] && !Object.keys(errors[type]).length && !Object.keys(errors.main).length;
            }
            this.errors = errors;
            this.typeValidate = true;
        },
        validateSnowFlake() {
            const errors = {};
            const snowflakeConnection = this.snowflakeConnection;
            if (!snowflakeConnection.account) errors.account = true;
            if (!snowflakeConnection.password) errors.password = true;
            if (!snowflakeConnection.username) errors.username = true;
            if (!snowflakeConnection.warehouse) errors.warehouse = true;
            if (!snowflakeConnection.database) errors.database = true;
            if (!snowflakeConnection.schema) errors.schema = true;
            return errors;
        },
        validateBigquery() {
            const errors = {};
            const bigqueryConnection = this.bigqueryConnection;
            if (!bigqueryConnection.secret) errors.secret = true;
            if (!bigqueryConnection.dataset) errors.dataset = true;
            return errors;
        },
        validatePostgres() {
            const errors = {};
            const postgresConnection = this.postgresConnection;
            if (!postgresConnection.password) errors.password = true;
            if (!postgresConnection.host) errors.host = true;
            if (!postgresConnection.port) errors.port = true;
            if (!postgresConnection.username) errors.username = true;
            if (!postgresConnection.database) errors.database = true;
            return errors;
        },
        validateLooker() {
            const errors = {};
            const looker_apiConnection = this.looker_apiConnection;
            if (!looker_apiConnection.host) errors.host = true;
            if (!looker_apiConnection.port) errors.port = true;
            if (!looker_apiConnection.database) errors.database = true;
            return errors;
        },
        validateAmazonRedShift() {
            const errors = {};
            const amazonRedShiftConnection = this.amazonRedShiftConnection;
            if (!amazonRedShiftConnection.password) errors.password = true;
            if (!amazonRedShiftConnection.host) errors.host = true;
            if (!amazonRedShiftConnection.port) errors.port = true;
            if (!amazonRedShiftConnection.username) errors.username = true;
            if (!amazonRedShiftConnection.database) errors.database = true;
            return errors;
        },
        setType() {
            this.connectionType = this.connectionTypeTemp;
        },
        save() {
            this.validate();
            if (this.validated) {
                const payload = this[`${this.connectionType}Connection`];
                payload.name = this.connectionName;
                payload.original_name = this.originalName;
                if (payload) {
                    this.updatingIndex = this.editIndex;
                    this.loading = true;
                    const action = `admin/${this.editIndex > -1 ? "editConnection" : "addConnection"}`;
                    this.$store.dispatch(action, payload)
                        .then(() => {
                            this.loading = false;
                            this.updatingIndex = -1;
                            this.$emit('queryConnections');
                            this.dialog = false;
                        }).catch(error => {
                            console.error(error);
                            this.loading = false;
                            this.updatingIndex = -1;
                            this.$alert({
                                type: 'error',
                                message: `Failed to add ${this.editIndex > -1 ? 'edit' : 'add'} connection`
                            });
                        })
                }
            }
        },
        clearTestResponse() {
            this.testResponse = '';
            this.testResponseType = '';
        }
    },
}
</script>