<template>
    <v-menu
      v-model="trigger"
      :position-x="position.x"
      :position-y="position.y"
      absolute
      offset-y
    >
      <v-card class="px-4">
        <v-list>
          <v-list-item-title
            v-for='(option, index) in options'
            :key='index'
            class="py-2 cursor-pointer context-menu-label"
            :class='{ "faded-text": disabled }'
            @click='action(option)'
            :disabled='disabled'
          >
            <span v-if="option.icon && !option.iconType" class="pr-2">
              <img :src='menuIcons[option.icon]' />
            </span>
            <span v-else-if="option.icon && option.iconType" class="pr-2">
              <v-icon class="default-icon-size">{{ option.icon }}</v-icon>
            </span>
            {{ option.label }}
          </v-list-item-title>
        </v-list>
      </v-card>
    </v-menu>
</template>

<style lang="less">
  .context-menu-label {
    font-size: 12px !important;
  }
</style>

<script>
import '../../assets/delete.svg';
import '../../assets/rename_text.svg';

export default {
    props: ['options', 'position', 'show', 'disabled'],
    methods: {
        selected(action) {
          this.$emit('action', action);
        },
        action(option) {
          const disabled = this.$props.disabled;
          if (!disabled) {
            this.$emit("selected", option.action);
          }
        }
    },
    computed: {
      menuIcons: function () {
        return {
          delete: static_url + "delete.svg",
          rename_text: static_url + "rename_text.svg",
        };
      },
      trigger: {
        get() {
          return this.show;
        },
        set(val) {
          if (!val) {
            return this.$emit('close');
          }
          return val;
        }
      }
    },
}
</script>