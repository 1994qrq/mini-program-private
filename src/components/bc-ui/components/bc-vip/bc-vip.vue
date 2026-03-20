<template>
  <view class="vip">
    <md-icon name="zuan" height="31.5" width="42" />
    <view class="m-left-8">{{ displayLabel }}</view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getLevelRule } from '@/config/vip-level';

const props = defineProps({
  level: Number,
});

const displayLabel = computed(() => {
  const rule = getLevelRule(props.level ?? 0);
  return rule?.label || '游客/来宾';
});
</script>

<style lang="scss" scoped>
.vip {
  background: #3e3d3c;
  display: flex;
  align-content: center;
  height: 38rpx;
  font-size: 26rpx;
  font-weight: bold;
  color: #fff2e8;
  padding: 0 12rpx;
  border-radius: 8rpx;
}
</style>
