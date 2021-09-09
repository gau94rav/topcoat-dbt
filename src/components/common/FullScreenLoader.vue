<template>
    <div class="full-screen-loader">
        <div class="spinner d-flex align-center">
            <v-icon class="spinner-loader">
                mdi-loading
            </v-icon>
            <div class="ml-2">{{ message }}</div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['message'],
}
</script>

<style lang="less">
    .full-screen-loader {
        position: fixed;
        left: 0;
        top: 0;
        margin: auto;
        width: 100%;
        height: 100%;
        margin: auto;
        background: rgba(0, 0, 0, 0.65);
        z-index: 200;
        color: #fff;
        .spinner {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            margin: auto;
            width: max-content;
            height: max-content;
            color: #fff;
            .spinner-loader {
                color: #fff;
            }
        }
    }
</style>