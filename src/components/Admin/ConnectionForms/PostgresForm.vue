<template>
    <div>
        <div class="modal-form-section">
            <div class="form-group">
                <label for="host">Host:</label>
                <input :disabled='loading || connection.yml' @input='checkValidation' :class="{'error-border': hasError('host')}" v-model="connection.host" id='host' type="text" class="form-control" placeholder="Enter host name or IP address">
            </div>
        </div>
        <div class="modal-form-section">
            <div class="modal-form-grid-preset-2">
                <div class="form-group">
                    <label for="port">Port:</label>
                    <input :disabled='loading || connection.yml' @input='checkValidation' :class="{'error-border': hasError('port')}" v-model="connection.port" id='port' type="text" class="form-control" placeholder="80">
                </div>
                <div class="form-group d-flex align-center justify-center">
                    <v-checkbox
                        v-model="connection.ssl"
                        label="SSL"
                        :disabled='loading || connection.yml'
                    ></v-checkbox>
                </div>
            </div>
        </div>
        <div class="modal-form-section">
            <div class="modal-form-grid">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input :disabled='loading || connection.yml' @input='checkValidation' :class="{'error-border': hasError('username')}" v-model="connection.username" id='username' type="text" class="form-control" placeholder="Enter username">
                </div>
                <div class="form-group">
                    <label for="username">Password:</label>
                    <input :disabled='loading' @input='checkValidation' :class="{'error-border': hasError('password')}" v-model="connection.password" id='username' type="password" class="form-control" placeholder="Enter password">
                </div>
            </div>
        </div>
        <div class="modal-form-section">
            <div class="form-group">
                <label for="showflake_schema">Database:</label>
                <input :disabled='loading || connection.yml' @input='checkValidation' :class="{'error-border': hasError('database')}" id='showflake_schema' v-model="connection.database" placeholder="Enter database name" type='text' class="form-control" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['loading', 'postgresConnection', 'errors'],
    methods: {
        checkValidation(event) {
            this.$emit('checkValidation', event);
        },
        hasError(property) {
            return this.errors['postgresConnection'] && this.errors['postgresConnection'][property];
        }
    },
    computed: {
        connection: {
            get() {
                return this.postgresConnection;
            },
            set(object) {
                this.$emit('updatedObject', object);
            }
        }
    }
}
</script>