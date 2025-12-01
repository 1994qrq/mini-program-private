<template>
  <view class="container">
    <text>测试页面 - 如果你能看到这个页面，说明编译正常</text>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const message = ref('测试成功');
</script>

<style scoped>
.container {
  padding: 40rpx;
  text-align: center;
}
</style>

