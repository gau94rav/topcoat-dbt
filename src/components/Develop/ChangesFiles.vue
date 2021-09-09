<template>
    <div>
        <div class="modal-label" v-if="data.length">
            {{ title }}:
        </div>
        <div class="modified-files">
            <div
                v-for="(file, index) in data"
                :key='index'
            >
                <div class="d-flex pb-1">
                    <v-icon>mdi-file-outline</v-icon>
                    <span class="d-flex align-end pl-1">{{ file }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['data', 'title'],
}
</script>