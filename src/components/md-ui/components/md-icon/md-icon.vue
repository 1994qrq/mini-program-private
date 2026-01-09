<template>
  <view
    class="md-icon"
    :style="{
      width: width && width.includes('%') ? width : (width ? width + 'rpx' : '100%'),
      height: imageMode === 'widthFix' ? 'auto' : (height && height.includes('%') ? height : (height ? height + 'rpx' : '100%')),
      borderRadius: circle ? '50%' : 'initial'
    }"
    @click="onClick">
    <image
      class="image"
      :mode="imageMode"
      :src="url ? url : `/static/${type === 'icon' ? 'icons' : 'images'}/${name}.png`" />
    <!-- 默认插槽 -->
    <view class="content" :style="customStyle">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
const emit = defineEmits(['click']);
defineProps({
  width: {
    type: String,
    default: '38',
  },
  height: {
    type: String,
    default: '38',
  },
  name: String,
  url: String,
  type: {
    type: String, // icon | bg
    default: 'icon',
  },
  customStyle: Object,
  circle: {
    type: Boolean,
    default: false,
  },
  imageMode: {
    type: String,
    default: 'aspectFill', // aspectFill | aspectFit | widthFix | scaleToFill
  },
});

const onClick = () => emit('click');
</script>

<style lang="scss" scoped>
.md-icon {
  position: relative;
  display: block;
  overflow: hidden;

  .image {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }

  .content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
}
</style>
