<template>
    <MonacoEditor
      v-model="contents"
      :style="{ minHeight: '160px', height: '200px', width: '580px' }"
      language="json"
      :options="{ lineNumbers: false, contextmenu: false, folding: false, minimap: { enabled: false }, scrollBeyondLastLine: false, scrollbar: { vertical: 'hidden', verticalScrollbarSize: 0 } }"
      >
    </MonacoEditor>
</template>

<script>

import { mapState, mapMutations } from 'vuex';
import MonacoEditor from 'vue-monaco';

export default {
    name: "UserMetadataEditor",
    components : {  MonacoEditor },
    props: {
      index: Number
    },
    computed: {
      ...mapState('admin', [
        'app_metadata',
        'new_user_metadata'
      ]),
      contents: {
        get () {
          if (this.index == null) {
            return this.new_user_metadata;
          } else {
            return this.app_metadata[this.index];
          }
        },
        set (value) {
          var valid = null;
          try {
              JSON.parse(value);
              valid = true;
          } catch(e) {
              valid = false
          }
          if (this.index != null) {
            var payload = {
              index: this.index,
              metadata: value,
              valid: valid
            }
            this.$store.dispatch('admin/userMetadata', payload);
          } else {
            this.$store.dispatch('admin/newUserMetadata', value);
            this.$store.dispatch('admin/newUserMetadataValid', valid);
          }
          this.$emit('metadataValid', valid);
        }
      }
    }
}
</script>

<style>
#renderWindow .CodeMirror {
  height: auto;
}
  .card-container {
    background: #f5f5f5;
    overflow: hidden;
    height: 100%;
  }
</style>
