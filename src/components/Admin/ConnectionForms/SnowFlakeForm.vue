<template>
    <div>
        <div class="modal-form-section">
            <div class="form-group">
                <label for="snowflake_account">Snowflake Account:</label>
                <input :disabled='loading || connection.yml' @input='checkValidation' :class="{'error-border': hasError('account')}" id='snowflake_account' v-model="connection.account" placeholder="Enter connection name" type='text' class="form-control" />
            </div>
        </div>
        <div class="modal-form-section">
            <div class="modal-form-grid">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input :disabled='loading || connection.yml' @input='checkValidation' :class="{'error-border': hasError('username')}" id='username' v-model="connection.username" placeholder="Enter username" type='text' class="form-control" />
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input :disabled='loading' @input='checkValidation' :class="{'error-border': hasError('password')}" type="password" id="password" v-model="connection.password" placeholder="Enter password" class="form-control" />
                </div>
            </div>
        </div>
        <div class="modal-form-section">
            <div class="form-group">
                <label for="showflake_warehouse">Warehouse:</label>
                <input :disabled='loading || connection.yml' @input='checkValidation' :class="{'error-border': hasError('warehouse')}" id='showflake_warehouse' v-model="connection.warehouse" placeholder="Enter warehouse name (ex. MyWareHouse)" type='text' class="form-control" />
            </div>
        </div>
        <div class="modal-form-section">
            <div class="form-group">
                <label for="showflake_warehouse">Database:</label>
                <input :disabled='loading || connection.yml' @input='checkValidation' :class="{'error-border': hasError('database')}" id='showflake_warehouse' v-model="connection.database" placeholder="Enter database name" type='text' class="form-control" />
            </div>
        </div>
        <div class="modal-form-section">
            <div class="form-group">
                <label for="showflake_schema">Schema:</label>
                <input :disabled='loading || connection.yml' @input='checkValidation' :class="{'error-border': hasError('schema')}" id='showflake_schema' v-model="connection.schema" placeholder="Enter schema name" type='text' class="form-control" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['loading', 'snowflakeConnection', 'errors'],
    methods: {
        checkValidation(event) {
            this.$emit('checkValidation', event);
        },
        hasError(property) {
            return this.errors['snowflakeConnection'] && this.errors['snowflakeConnection'][property];
        }
    },
    computed: {
        connection: {
            get() {
                return this.snowflakeConnection;
            },
            set(object) {
                this.$emit('updatedObject', object);
            }
        }
    }
}
</script>