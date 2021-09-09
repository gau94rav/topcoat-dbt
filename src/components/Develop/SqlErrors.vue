<template>
    <div class="sql-errors">
        <div class="error-message" v-for="(error, index) in errors" :key='index'>
            <div class="d-flex">
                <v-icon>mdi-alert-circle</v-icon>
                <div class="error-text pl-2">{{ error.message }}</div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
    computed: {
        ...mapState('ide', [
            'openFiles',
            'selectedIndex',
        ]),
        errors() {
            const file = this.openFiles[this.selectedIndex];
            return file ? file.queryErrors : [];
        },
    }    
}
</script>