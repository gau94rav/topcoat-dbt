<template>
  <v-layout class="admin-container">
    <admin-left-nav />
    <div class="admin-view">
      <router-view class="px-10 py-12"></router-view>
    </div>
  </v-layout>
</template>

<style lang='less'>
.admin-container {
  height: 100%;
  overflow: auto;
  .admin-view {
    position: relative;
    width: 100%;
  }
}
</style>

<script>
import AdminLeftNav from "./AdminLeftNav";

export default {
  name: "Admin",
  components: { AdminLeftNav },
};
</script>
