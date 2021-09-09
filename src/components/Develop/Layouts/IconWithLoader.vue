<template>
  <span class="sidebar-toggle-container">
    <v-icon
      class="loader"
      :class="{'spinner-loader': loading}"
      @click="$emit('clicked')"
    >{{ loading ? "mdi-loading" : icon }}</v-icon>
  </span>
</template>

<script>
export default {
  props: ["loading", "icon"],
};
</script>

<style lang="less">
.sidebar-toggle-container {
  button {
    font-size: 14px !important;
  }
}
</style>
