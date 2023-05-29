<template>
  <span class="icon-font anticon" :style="computedStyle">
    <svg aria-hidden="true" width="1em" height="1em" focusable="false" fill="currentColor">
      <use :xlink:href="'#' + type"></use>
    </svg>
  </span>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

interface IProps {
  type: string;
  fontSize?: string;
  color?: string;
}
const props = withDefaults(defineProps<IProps>(), {
  fontSize: '',
  color: ''
});
const computedStyle = computed(() => {
  return {
    color: props.color,
    fontSize: props.fontSize
  };
});
</script>

<style scoped>
.icon-font {
  width: 1em;
  height: 1em;
  /* vertical-align: -0.15em; */
  overflow: hidden;
  box-sizing: border-box;
  line-height: 1 !important;
}
</style>
