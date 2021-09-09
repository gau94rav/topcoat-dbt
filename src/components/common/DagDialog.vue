<template>
  <div class="dag-dialog">
    <v-dialog v-model="dialog" width="90%">
      <template v-slot:activator="{ on, attrs }">
        <v-btn height="32px" @click="$emit('open')" v-bind="attrs" v-on="on">
          <v-icon size="medium">mdi-lan</v-icon>
          <a href="#" class="btn-title">Dag</a>
        </v-btn>
      </template>
      <v-card>
        <div class="dialog-header">
          <v-card-title class="dag-dialog-title">Complete DAG</v-card-title>
          <v-icon size="x-large" class="close-btn" @click="closeDialog">mdi-close</v-icon>
        </div>
        <v-spacer></v-spacer>
        <div v-if="dag_component_visible" style="height: 70vh;">
          <Dag :key="dag_update_time" :dag="full_dag" />
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Dag from "../Develop/Dag";
export default {
  props: ["dag_component_visible", "dag_update_time", "full_dag"],
  data: () => ({
    dialog: false,
  }),
  components: { Dag },
  methods: {
    closeDialog() {
      this.dialog = false;
      this.$emit("close");
    },
  },
};
</script>

<style lang="less">
.dag-dialog {
  .v-card {
    overflow: hidden;
  }
  .dialog-header {
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #e8e8e8;
    .dag-dialog-title {
      font-size: 16px !important;
      font-weight: 600 !important;
    }
    .close-btn {
      padding-right: 15px;
      cursor: pointer;
    }
  }
}
.v-dialog__container {
  display: unset !important;
}
</style>