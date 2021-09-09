<template>
  <div class="tabs-container">
    <div class="header-tabs d-flex">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="nav-link nav-link-text"
        :class="{'active-tab': tab.id === id}"
        @click='setActive(tab)'
      >
        <span class="link-label">{{ tab.label }}</span>
      </div>
      <div class="nav-link-text preview-button px-4">
        <a href="/" class="d-flex" target="_blank">
          <span class="link-label btn-title">Preview</span>
          <img :src="playIcon" class="play-icon">
        </a>
      </div>
    </div>
  </div>
</template>

<style lang="less">
.tabs-container {
  display: flex;
  width: max-content;
  align-items: center;
  .nav-link {
    color: #707070;
    height: 100%;
    align-items: center;
    width: 82px;
    cursor: pointer;
    text-align: center;
    padding: 8px 0;
    .link-label, a {
      font-size: 12px !important;
      font-family: "Montserrat-Medium" !important;
    }
  }
  .preview-button {
    position: relative;
    text-transform: none !important;
    left: 30px;
    display: flex;
    align-self: center;
    background: rgba(42, 157, 143, 0.08);
    padding: 8px 0;
    border-radius: 3px;
    .btn-title {
      color: #2a9d8f;
      font-family: "Montserrat-Medium" !important;
      text-transform: none !important;
      font-size: 12px;
    }
    img {
      margin-left: 20px;
    }
  }
  .active-tab {
    border-bottom: 2px solid #2a9d8f;
  }
  .nav-link-text {
    color: #272727 !important;
  } 
}


@media (max-width: 1152px) {
  .header {
    .v-toolbar__content {
      padding: 0px !important;
    }
    .left-section {
      .navbar-tabs {
        .nav-link {
          width: 60px;
          .link-label {
            font-size: 10px !important;
          }
        }
      }
      .preview-button {
        left: 0 !important;
        padding: 0px;
        background: transparent;
        .link-label {
          display: none;
        }
        img {
          margin-left: 5px;
        }
      }
    }
  }
}
</style>

<script>
import { mapState } from 'vuex';
export default {
  data: () => ({
    id: 1
  }),
  computed: {
    ...mapState("git", ["configured", "dev_enabled"]),
    ...mapState("admin", ["activeAdminSection"]),
    tabs() {
      const devMode = this.configured && this.dev_enabled;
      const items = [];
      if (devMode) {
        items.push({ id: 1, route: '/develop', label: 'Develop' });
      }
      const adminRoute = this.activeAdminSection || '/admin';
      items.push({ id: 2, route: adminRoute, label: 'Admin' });
      return items;
    },
    playIcon() {
      return static_url + "play.svg";
    },
  },
  methods: {
    setActive(tab = null) {
      if (!tab) {
        const route = window.location.pathname;
        return this.id = route.includes('admin') ? 2 : 1;
      }
      if (!tab || tab.id === this.id) return false;

      this.id = tab.id;
      this.$router.push({path: tab.route});
    }
  },
  mounted() {
    this.setActive();
  },
}
</script>
