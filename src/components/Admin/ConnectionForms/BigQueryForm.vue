<template>
    <div>
        <div class="modal-form-section">
            <div class="form-group">
                <label for="google_json">Service account credentials (JSON):</label>
                <v-textarea
                    outlined
                    dense
                    v-model="connection.secret"
                    placeholder="Cut and paste service account JSON"
                    :class="{'error-border-fieldset': hasError('secret')}"
                    @input='checkValidation'
                    :disabled='loading || connection.yml'
                />
            </div>
            <div class="form-group">
                <label for="dataset">Dataset:</label>
                <input id='dataset' :disabled='loading || connection.yml' @input='checkValidation' :class="{'error-border': hasError('dataset')}" v-model="connection.dataset" placeholder="Enter dataset" type='text' class="form-control" />
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['loading', 'bigqueryConnection', 'errors'],
    methods: {
        checkValidation(event) {
            this.$emit('checkValidation', event);
        },
        hasError(property) {
            return this.errors['bigqueryConnection'] && this.errors['bigqueryConnection'][property];
        }
    },
    computed: {
        connection: {
            get() {
                return this.bigqueryConnection;
            },
            set(object) {
                this.$emit('updatedObject', object);
            }
        }
    }
}
</script>