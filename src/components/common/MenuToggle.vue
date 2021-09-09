<template>
  <div class="text-center header-control-card">
    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <div class="arrow-down" v-bind="attrs" v-on="on"></div>
      </template>
      <v-list class="header-control-list">
        <v-list-item>
          <v-list-item-title>
            <!-- <div class="hidden-item py-1">
              <router-link to='/develop'>Develop</router-link>
            </div>
            <div class="hidden-item py-1">
              <router-link to='/admin'>Admin</router-link>
            </div> -->
            <div class="py-1">
              <a :href="logout_url">Logout</a>
            </div>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
export default {
  computed: {
    logout_url: function () {
      return (
        "/logout?returnTo=" +
        encodeURIComponent(
          window.location.origin + "/" + this.$route.path.split("/")[1]
        )
      );
    },
  }
};
</script>

<style lang="less">
@media (max-width: 1152px) {
  .header-control-list {
    .hidden-item {
      display: block !important;
    }
  }
}

.header-control-list {
  .hidden-item {
    display: none;
  }
  a {
    text-decoration: none !important;
    color: #272727 !important;
    font-size: 12px;
  }
}
.v-menu {
  display: block !important;
}
</style>