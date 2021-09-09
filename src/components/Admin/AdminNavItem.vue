<template>
  <v-list-item>
    <v-list-item-content
      @mouseenter="color = '#2a9d8f'"
      @mouseleave="color = !active ? '#272727' : '#2a9d8f'"
    >
      <router-link class="nav-link" :class="{'highlighted-admin-nav': active}" :to="route">
        <slot :color='color'></slot>
        <div :style='{color}' class="route-title px-5">{{ title }}</div>
      </router-link>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
export default {
  props: ['title', 'route'],
  data: () => ({
    active: false,
  }),
  computed: {
    color: {
      get() {
        const route = this.$route;
        this.active = this.$props.route == route.path;
        return this.active ? "#2a9d8f" : "#272727";
      },
      set(val) {
        return val;
      }
    }
  },
}
</script>