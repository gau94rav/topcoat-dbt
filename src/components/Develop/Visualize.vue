<template>
      <div style="height: inherit; width: 100%; background: white; z-index: 0">
          <v-icon v-if='iframeLoading' class="spinner-loader">mdi-loading</v-icon>
          <div style="position: relative; height: inherit; width: inherit; z-index: 2;">
            <iframe id='visualize_iframe' :srcdoc="visualization" sandbox="allow-same-origin allow-scripts" frameborder=0 scrolling="no" :style="{ width: '100%', height: 'inherit', zIndex: '10000' }"></iframe>
          </div>
      </div>
</template>

<script>

import { mapState } from 'vuex';

export default {
    name: "Visualize",
    props: {
      index: {
        type: Number,
        default: null
      }
    },
    data () {
      return {
        backgroundColor : "white",
        iframeLoading: true,
      }
    },
    mounted() {
      this.checkIframeLoaded();
    },
    methods: {
      checkIframeLoaded() {
        var iframe = document.getElementById('visualize_iframe');
        var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (  iframeDoc.readyState  == 'complete' ) {
            this.iframeLoading = false;
            return;
        } 
        window.setTimeout(this.checkIframeLoaded, 100);
      }
    },
    computed: {
      ...mapState('ide', [
          'openFiles'
        ]),
      visualization() {
          if (this.openFiles && this.index != null) {
              return this.openFiles[this.index].visualization;
          }
          else return null;
      },
    }
}
</script>

<style>
</style>
