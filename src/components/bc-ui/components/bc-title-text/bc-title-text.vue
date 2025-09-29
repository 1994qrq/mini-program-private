<template>
  <view class="bc-title-text">
    <image class="icon" src="/static/icons/star.png" mode="aspectFill" />
    <text class="text">{{ text }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>

<style lang="scss" scoped>
.bc-title-text {
  display: flex;
  align-items: flex-start; /* 顶部对齐，图标与第一行齐平 */
  padding: 16rpx 20rpx;
  margin: 20rpx 30rpx;
  border-radius: 12rpx;
  box-sizing: border-box;
  background: #f6f8ff; /* 很浅的蓝紫底 */
  border: 1rpx solid #c9d5ff; /* 淡淡的边框线 */
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06); /* 轻微投影 */
  .icon {
    width: 33rpx;   /* 42 x 45 */
    height: 26rpx;
    margin-right: 12rpx;
    margin-top: 6rpx;
  }
  .text {
    color: #1b1b1b;
    line-height: 1.6;
  }
}
</style>
