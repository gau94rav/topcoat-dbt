<template>
    <transition name='zoom'>
        <v-card
            class="popover-container"
            elevation="0"
            outlined
            :style='{top, left}'
            v-show="show"
        >
            <slot></slot>
        </v-card>
    </transition>
</template>

<script>
export default {
    props: ['top', 'left', 'show'],
}
</script>

<style lang="less">
    .popover-container {
        position: fixed !important;
        min-width: 100px !important;
        max-width: 300px !important;
        z-index: 50 !important;
        padding: 15px;
        height: max-content;
        overflow: hidden;
        margin: auto;
    }
</style>