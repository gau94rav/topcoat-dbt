<template>
    <div>
        <div class="modal-form-section">
            <div class="modal-form-grid-preset-2">
                <div class="form-group">
                    <label for="host">Host:</label>
                    <input :disabled='loading || connection.yml' @input='checkValidation' :class="{'error-border': hasError('host')}" v-model="connection.host" id='host' type="text" class="form-control" placeholder="Enter host name">
                </div>
                <div class="form-group">
                    <label for="port">Port:</label>
                    <input :disabled='loading || connection.yml' @input='checkValidation' :class="{'error-border': hasError('port')}" v-model="connection.port" id='port' type="text" class="form-control" placeholder="80">
                </div>
            </div>
            <div class="modal-form-section">
                <div class="form-group">
                    <label for="database">Database:</label>
                    <input :disabled='loading || connection.yml' @input='checkValidation' :class="{'error-border': hasError('database')}" v-model="connection.database" id='database' type="text" class="form-control" placeholder="Enter database name">
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['loading', 'looker_apiConnection', 'errors'],
    methods: {
        checkValidation(event) {
            this.$emit('checkValidation', event);
        },
        hasError(property) {
            return this.errors['looker_apiConnection'] && this.errors['looker_apiConnection'][property];
        }
    },
    computed: {
        connection: {
            get() {
                return this.looker_apiConnection;
            },
            set(object) {
                this.$emit('updatedObject', object);
            }
        }
    }
}
</script>